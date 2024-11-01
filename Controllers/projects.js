
const { pool } = require("../config/db");
const fs = require("fs");
const path = require('path');

// Get project by ID
exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                "SELECT * FROM projects WHERE project_id = ?",
                [id]
            );
            if (rows.length > 0) {
                res.status(200).json(rows[0]);
            } else {
                res.status(404).json({ message: "Project not found." });
            }
        } finally {
            connection.release();
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// List all projects
exports.listProjects = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query("SELECT * FROM projects");
            res.status(200).json(rows);
        } finally {
            connection.release();
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create new project with certifications and images
exports.createProject = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const {
            project_name,
            price,
            description,
            start_date,
            end_date,
            project_type_id,
            created_by,
            certification_name,
            certification_agency,
            issued_date,
            expiry_date,
        } = req.body;

        await connection.beginTransaction();  // Start a transaction

        const [result] = await connection.query(
            "INSERT INTO projects (project_name, price, description, start_date, end_date, project_type_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [project_name, price, description, start_date, end_date, project_type_id, created_by]
        );

        const projectId = result.insertId;  // Get the inserted project ID

        await connection.query(
            "INSERT INTO certifications (certification_name, certification_agency, issued_date, expiry_date, project_id) VALUES (?, ?, ?, ?, ?)",
            [certification_name, certification_agency, issued_date, expiry_date, projectId]
        );

        let startYear = Number(start_date.substr(0, 4));
        let endYear = Number(end_date.substr(0, 4));

        // Insert yearly carbon credits for the project
        while (startYear < endYear) {
            const startYearString = `${startYear}${start_date.substr(4)}`;
            const endYearString = `${startYear + 1}${start_date.substr(4)}`;
            await connection.query(
                "INSERT INTO carboncredits (project_id, credit_start_date, credit_end_date, credit_amount) VALUES (?, ?, ?, ?)",
                [projectId, startYearString, endYearString, null]
            );
            startYear++;
        }

        // Handle images
        const file1 = req.files.file1 ? req.files.file1[0].filename : "noimage.jpg";
        const file2 = req.files.file2 ? req.files.file2[0].filename : "noimage.jpg";
        const file3 = req.files.file3 ? req.files.file3[0].filename : "noimage.jpg";

        await connection.query(
            "INSERT INTO project_images (project_id, image1, image2, image3) VALUES (?, ?, ?, ?)",
            [projectId, file1, file2, file3]
        );

        await connection.commit();  // Commit the transaction

        res.status(201).json({ message: "Project created successfully with certifications and carbon credits" });
    } catch (err) {
        await connection.rollback();  // Rollback the transaction in case of error
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        connection.release();  // Release the connection
    }
};

// Update project
exports.updateProject = async (req, res) => {
    const connection = await pool.getConnection();
    let { id } = req.params;
    id = Number(id);

    const {
        project_name,
        price,
        description,
        start_date,
        end_date,
        project_type_id,
        created_by,
        certification_name,
        certification_agency,
        issued_date,
        expiry_date,
        fileOld1,
        fileOld2,
        fileOld3
    } = req.body;

    try {
        await connection.beginTransaction();  // Start a transaction

        // Update project details
        await connection.query(
            `UPDATE projects SET project_name = ?, price = ?, description = ?, start_date = ?, end_date = ?, project_type_id = ?, created_by = ? WHERE project_id = ?`,
            [project_name, price, description, start_date, end_date, project_type_id, created_by, id]
        );

        // Update certifications
        await connection.query(
            `UPDATE certifications SET certification_name = ?, certification_agency = ?, issued_date = ?, expiry_date = ? WHERE project_id = ?`,
            [certification_name, certification_agency, issued_date, expiry_date, id]
        );

        // Prepare for the file updates
        let newImages = {
            image1: fileOld1,
            image2: fileOld2,
            image3: fileOld3,
        };

        if (req.files['file1']) {
            const file1 = req.files['file1'][0];
            newImages.image1 = file1.filename;
            if (fileOld1 !== 'noimage.jpg') {
                const oldImagePath1 = path.join(__dirname, '../uploads', fileOld1);
                if (fs.existsSync(oldImagePath1)) fs.unlinkSync(oldImagePath1);
            }
        }

        if (req.files['file2']) {
            const file2 = req.files['file2'][0];
            newImages.image2 = file2.filename;
            if (fileOld2 !== 'noimage.jpg') {
                const oldImagePath2 = path.join(__dirname, '../uploads', fileOld2);
                if (fs.existsSync(oldImagePath2)) fs.unlinkSync(oldImagePath2);
            }
        }

        if (req.files['file3']) {
            const file3 = req.files['file3'][0];
            newImages.image3 = file3.filename;
            if (fileOld3 !== 'noimage.jpg') {
                const oldImagePath3 = path.join(__dirname, '../uploads', fileOld3);
                if (fs.existsSync(oldImagePath3)) fs.unlinkSync(oldImagePath3);
            }
        }

        // Update images
        await connection.query(
            `UPDATE project_images SET image1 = ?, image2 = ?, image3 = ? WHERE project_id = ?`,
            [newImages.image1, newImages.image2, newImages.image3, id]
        );

        await connection.commit();  // Commit the transaction
        res.status(200).json({ message: "Project updated successfully" });
    } catch (err) {
        await connection.rollback();  // Rollback the transaction in case of error
        console.error("Error updating project:", err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        connection.release();  // Release the connection
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Get related images before deleting
        const [imageRows] = await connection.query(
            "SELECT image1, image2, image3 FROM project_images WHERE project_id = ?",
            [id]
        );

        // Delete related data
        await connection.query("DELETE FROM carboncredits WHERE project_id = ?", [id]);
        await connection.query("DELETE FROM certifications WHERE project_id = ?", [id]);
        await connection.query("DELETE FROM project_images WHERE project_id = ?", [id]);

        const [result] = await connection.query("DELETE FROM projects WHERE project_id = ?", [id]);

        if (result.affectedRows > 0) {
            imageRows.forEach((imageRow) => {
                ['image1', 'image2', 'image3'].forEach((imageField) => {
                    const imagePath = path.join(__dirname, '../uploads', imageRow[imageField]);
                    if (imageRow[imageField] && fs.existsSync(imagePath) && imageRow[imageField] !== 'noimage.jpg') {
                        fs.unlinkSync(imagePath);
                    }
                });
            });

            await connection.commit();
            res.status(200).json({ message: "Project deleted successfully" });
        } else {
            await connection.rollback();
            res.status(404).json({ message: "Project not found" });
        }
    } catch (err) {
        await connection.rollback();
        console.error("Error deleting project:", err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        connection.release();
    }
};

// List all project data with filtering options
exports.listAllProjectsDetails = async (req, res) => {
    const { projectTypeId, minPrice, maxPrice } = req.query;
    const limit = req.query.limit || 20;
    const params = [];

    let query = `
        SELECT p.project_id, p.project_name, p.description, p.price, p.start_date, p.end_date, p.created_by, p.project_type_id, p.status_id,
               pi.image1, pi.image2, pi.image3,
               c.certification_name, c.certification_agency, c.issued_date, c.expiry_date
        FROM projects p
        LEFT JOIN project_images pi ON p.project_id = pi.project_id
        LEFT JOIN certifications c ON p.project_id = c.project_id
    `;

    if (projectTypeId && projectTypeId != 0) {
        query += ` WHERE p.project_type_id = ?`;
        params.push(Number(projectTypeId));
    }

    if (minPrice) {
        query += params.length ? ` AND p.price >= ?` : ` WHERE p.price >= ?`;
        params.push(Number(minPrice));
    }

    if (maxPrice) {
        query += params.length ? ` AND p.price <= ?` : ` WHERE p.price <= ?`;
        params.push(Number(maxPrice));
    }

    query += ` LIMIT ?`;
    params.push(Number(limit));

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(query, params);
        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({ message: "No projects found" });
        }

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get detailed project data by ID
exports.getAllProjectDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await pool.getConnection();
       
        const [rows] = await connection.query(`
            
            SELECT 
             -- Adding project_type_id from project_types table
            p.project_id, p.project_name, p.description, p.price, p.start_date, p.end_date,
            pi.image1, pi.image2, pi.image3,
            c.certification_name, c.certification_agency, c.issued_date, c.expiry_date,
            pt.project_type_name
            FROM projects p
            LEFT JOIN project_images pi ON p.project_id = pi.project_id
            LEFT JOIN certifications c ON p.project_id = c.project_id
            LEFT JOIN project_types pt ON p.project_type_id = pt.project_type_id  -- Correcting the join
            WHERE p.project_id = ?;

            `, [id])

        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateProjectStatus = async (req, res) => {
    const connection = await pool.getConnection();
    let { id } = req.params;  // Get project ID from the request params
    id = Number(id);

    const { status_id } = req.body;  // Get the new status_id from the request body

    try {
        await connection.beginTransaction();  // Start a transaction

        // Update the project status
        const [result] = await connection.query(
            `UPDATE projects SET status_id = ? WHERE project_id = ?`,
            [status_id, id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();  // Rollback the transaction if no rows were updated
            return res.status(404).json({ message: "Project not found" });
        }

        await connection.commit();  // Commit the transaction
        res.status(200).json({ message: "Project status updated successfully" });
    } catch (err) {
        await connection.rollback();  // Rollback the transaction in case of error
        console.error("Error updating project status:", err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        connection.release();  // Release the connection
    }
};
