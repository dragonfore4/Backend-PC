const { pool } = require("../config/db")

exports.list = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        try {

            const [rows] = await connection.query("Select * FROM certification")
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
            const [rows] = await connection.query("Select * FROM certifications WHERE project_id = ?",[id])

            if (rows.length > 0) {
                // console.log(rows)
                res.status(200).json(rows[0])
            } else {
                res.status(404).json({message: "Project Not found"});
            }
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}