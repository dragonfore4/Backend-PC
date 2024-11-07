const { pool } = require("../config/db");  // Assuming you're using a MySQL connection pool

exports.addProjectToCart = async (req, res) => {
    const { cartId } = req.params;      // Cart ID from the URL
    const { project_id } = req.body;    // project_id from the request body

    if (!project_id) {
        return res.status(400).json({ message: "Project ID is required" });
    }

    try {
        const connection = await pool.getConnection();
        try {
            // Check if the project (product) exists
            const [project] = await connection.query("SELECT * FROM projects WHERE project_id = ?", [project_id]);
            if (project.length === 0) {
                return res.status(404).json({ message: "Project not found" });
            }

            // Check if the product is already in the cart
            const [existingCartProject] = await connection.query(
                "SELECT * FROM cart_project WHERE cart_id = ? AND project_id = ?",
                [cartId, project_id]
            );

            if (existingCartProject.length > 0) {
                // If the project is already in the cart, just return a message (no action needed)
                return res.status(200).json({ message: "Project is already in the cart" });
            } else {
                // Add the new project to the cart
                await connection.query(
                    "INSERT INTO cart_project (cart_id, project_id) VALUES (?, ?)",
                    [cartId, project_id]
                );
            }

            res.status(200).json({ message: "Project added to cart successfully" });
        } finally {
            connection.release();  // Release the MySQL connection
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.getCartDetails = async (req, res) => {
    const { cartId } = req.params;

    try {
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.query(
                `SELECT 
                    cp.cart_id, 
                    p.project_id, 
                    p.project_name, 
                    p.description, 
                    p.price, 
                    p.start_date, 
                    p.end_date, 
                    p.created_by,
                    pt.project_type_name, 
                    ps.status_name,
                    pi.image1, 
                    pi.image2, 
                    pi.image3
                FROM cart_project cp
                JOIN projects p ON cp.project_id = p.project_id
                JOIN project_types pt ON p.project_type_id = pt.project_type_id
                JOIN project_status ps ON p.status_id = ps.status_id
                JOIN project_images pi ON p.project_id = pi.project_id
                WHERE cp.cart_id = ?`,
                [cartId]
            );

            res.status(200).json(rows);
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteProjectFromCart = async (req, res) => {
   const { cartId, projectId } = req.params;
   try {
    
    const connection = await pool.getConnection();

    try {
        connection.beginTransaction();
        const [result] = await connection.query("DELETE FROM cart_project WHERE cart_id = ? AND project_id = ?", [cartId, projectId]);
        if (result.affectedRows === 1) {
            await connection.commit()
            return res.status(200).json({ message: "Delete project in cart successfully" });
        } else {
            await connection.rollback()
            res.status(404).json({ message: "Project not found in the cart" });
        }

    } finally {
        connection.release();
    }


   } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
   }
   
}

exports.getCartIdByUsername = async (req, res) => {
    const { username } = req.params;  // Get the username from the request parameters

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    try {
        const connection = await pool.getConnection();
        
        try {
            // Query to get the user_id from the username
            const [user] = await connection.query("SELECT user_id FROM user WHERE username = ?", [username]);
            if (user.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const userId = user[0].user_id;

            // Query to get the cart_id from the user_id
            const [cart] = await connection.query("SELECT cart_id FROM carts WHERE user_id = ?", [userId]);
            if (cart.length === 0) {
                return res.status(404).json({ message: "Cart not found for the user" });
            }

            const cartId = cart[0].cart_id;

            res.status(200).json({ cart_id: cartId });
        } finally {
            connection.release();  // Release the MySQL connection
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};