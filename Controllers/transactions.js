const { connection } = require("mongoose");
const { pool } = require("../config/db")

exports.checkOut = async (req, res) => {
    const { cart_id, buyer_name } = req.body;
    const connection = await pool.getConnection();
    try {
        try {
            await connection.beginTransaction();
            // 0.) Get buyer_id from buyer_name
            const [buyer_id_result] = await connection.query("SELECT user_id FROM users WHERE username = ?",
                [buyer_name]
            )

            const buyer_id = (buyer_id_result[0].user_id)
            // 1.) Select all projects in the cart
            const [cartProjects] = await connection.query(
                "SELECT project_id FROM cart_project WHERE cart_id = ?", 
                [cart_id]
            );
            if (cartProjects.length === 0) {
                console.log("Cart is empty.");
                await connection.rollback();  // Rollback if no projects in cart
                return res.status(400).json({ message: "Cart is empty" });
            }

            // 2.) Check availability for each project
            for (let i = 0; i < cartProjects.length; i++) {
                const [project] = await connection.query(
                    "SELECT * FROM projects WHERE project_id = ?", 
                    [cartProjects[i].project_id]
                );
                console.log(project[0])
                if (project[0].status_id === 3) {
                    await connection.rollback();
                    return res.status(400).json({ message: `Project ${project[0].project_name} is sold out.` });
                }
            }

            // 3.) Calculate total price and update status to Sold Out
            let totalPrice = 0;
            for (let i = 0; i < cartProjects.length; i++) {
                const [project] = await connection.query(
                    "SELECT * FROM projects WHERE project_id = ?", 
                    [cartProjects[i].project_id]
                );
                totalPrice += Number(project[0].price);
                console.log(project[0].project_id)
                await connection.query(
                    "UPDATE projects SET status_id = 3 WHERE project_id = ?", 
                    [project[0].project_id]
                );
            }
            // console.log(totalPrice)
            // 4.) Insert transaction with 'pending' status
            const [transactionResult] = await connection.query(
                "INSERT INTO transactions (buyer_id, amount, status) VALUES (?,  ?, 'pending')", 
                [buyer_id, totalPrice]
            );
        
            const transactionId = transactionResult.insertId;
            console.log(`Transaction created with ID: ${transactionId} and total amount: ${totalPrice}`);

            // 5.) Update Carbon credits with transaction_id
            for (let i = 0; i < cartProjects.length; i++) {
                const [project] = await connection.query(
                    "SELECT * FROM projects WHERE project_id = ?", 
                    [cartProjects[i].project_id]
                );
                await connection.query(
                    "UPDATE carboncredits SET transaction_id = ? WHERE project_id = ?", 
                    [transactionId, project[0].project_id]
                );
                console.log(`Carbon credits updated for project ID: ${project[0].project_id}`);
            }

           
            await connection.commit();
            res.status(200).json({ message: "Buy Projects in cart completed" });
        } catch (error) {
            await connection.rollback();
            console.error("Transaction error:", error);
            res.status(500).json({ message: "Checkout failed", error: error.message });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("Connection error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query("SELECT * FROM transactions WHERE transaction_id = ?", [id]);
            res.status(200).json(rows);
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("Connection error:", err);
        res.status(500).json({ message: "Internal server error" });
    }

};
exports.listTransactions = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query("SELECT * FROM transactions ");
            res.status(200).json(rows);
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("Connection error:", err);
        res.status(500).json({ message: "Internal server error" });
    }

};