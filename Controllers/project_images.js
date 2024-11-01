const { pool } = require("../config/db")
const path = require("path")

exports.list = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        try {

            const [rows] = await connection.query("Select * FROM project_images")
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
            const [rows] = await connection.query("Select * FROM project_images WHERE project_id = ?", [id])

            if (rows.length > 0) {
                // console.log(path.resolve(__dirname, "../uploads", rows[0].image))
                // const imagePath = (path.resolve(__dirname, "../uploads", rows[0].image))
                res.status(200).json(rows[0])
                // res.sendFile(imagePath)
            } else {
                res.status(404).json({ message: "Project_images Not found" });
            }
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}


exports.readByName = async (req, res) => {
    // try {
    //     // const connection = await pool.getConnection();
    //     const { name } = req.params;
    //     try {
    //         // const [rows] = await connection.query("Select * FROM project_images WHERE project_id = ?",[id])

    //         if (rows.length > 0) {
    //             // console.log(path.resolve(__dirname, "../uploads", rows[0].image))
    //             const imagePath = (path.resolve(__dirname, "../uploads", name))
    //             // res.status(200).json(rows[0])
    //             res.sendFile(imagePath)
    //         } else {
    //             res.status(404).json({message: "Project_images Not found"});
    //         }
    //     } finally {
    //         connection.release();
    //     }
    // } catch (err) {
    //     console.error(err)
    //     res.status(500).json({ message: "Internal server error" })
    // }

    try {
        const { name } = req.params
        const imagePath = (path.resolve(__dirname, "../uploads", name))
        res.sendFile(imagePath)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}