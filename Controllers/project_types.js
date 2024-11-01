const { pool } = require("../config/db")

exports.list = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        try {

            const [rows] = await connection.query("Select * FROM project_types")
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
