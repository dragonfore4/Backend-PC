const { connection } = require("mongoose");
const { pool } = require("../config/db")

exports.list = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        try {

            const [rows] = await connection.query("Select * FROM carboncredits")
            // console.log(rows)
            res.status(200).json(rows)
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}


exports.read = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const { id } = req.params;
        try {
            const [rows] = await connection.query("Select * FROM carboncredits WHERE project_id = ?", [id])

            if (rows.length > 0) {
                // console.log(rows)
                res.status(200).json(rows)
            } else {
                res.status(404).json({ message: "Project Not found" });
            }
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

exports.update = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const { carbon_credit_id, carbon_amount } = req.body;
            console.log(carbon_credit_id, carbon_amount)
            const [rows] = await connection.query("UPDATE carboncredits SET credit_amount = ? WHERE carbon_credit_id = ?", [carbon_amount, carbon_credit_id]);
            res.status(200).json({ message: "Carbon credit updated successfully" })
        }

        finally {
            await connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(200).json({ message: "Internal server error" })
    }
}

exports.listCarbonCreditByProjectId = async (req, res) => {
    try {

        const connection = await pool.getConnection();
        try {
            const { project_id } = req.params;
            const [rows] = await connection.query("Select * FROM carboncredits WHERE project_id = ?", [project_id])
            return res.status(200).json(rows)
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(200).json({ message: "Internal server error" })
    }
}