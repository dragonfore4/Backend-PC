const { pool } = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const secretKey = process.env.SECRET_KEY || "mysecret"; // Moved to environment variable

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                "SELECT * FROM USERS WHERE username = ?",
                [username]
            );

            if (rows.length === 0) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

            // Create JWT
            const payload = { username, role: user.role };
            const token = jwt.sign(payload, secretKey, { expiresIn: "4h" });

            // Set the JWT as a cookie
            res.cookie("token", token, {
                httpOnly: false,
                secure: false, // Ensure this is false for local development (no HTTPS on localhost)
                sameSite: "strict",
                maxAge: 4 * 60 * 60 * 1000, // 4 hours
            });

            console.log("Cookie set:", token); // Log to check if cookie is set on server

            return res.status(200).json({
                message: "Login successful",
            });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.register = async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const connection = await pool.getConnection();
        try {
            // Check if the username or email already exists
            const [rowsUsername] = await connection.query(
                "SELECT username FROM USERS WHERE username = ?",
                [username]
            );
            const [rowsEmail] = await connection.query(
                "SELECT email FROM USERS WHERE email = ?",
                [email]
            );

            if (rowsUsername.length > 0 || rowsEmail.length > 0) {
                return res.status(400).json({ message: "Username or email already exists" });
            }

            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Start a transaction to ensure data consistency
            await connection.beginTransaction();

            // Insert new user
            const [result] = await connection.query(
                "INSERT INTO USERS (username, password, email) VALUES (?, ?, ?)",
                [username, hashedPassword, email]
            );

            const userId = result.insertId; // Get the inserted user's ID

            // Insert a cart for the newly registered user
            await connection.query(
                "INSERT INTO CARTS (user_id) VALUES (?)",
                [userId]
            );

            // Commit the transaction
            await connection.commit();

            res.status(201).json({ message: "User registered and cart created successfully" });
        } catch (err) {
            // Rollback in case of error
            await connection.rollback();
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        } finally {
            connection.release(); // Release the connection back to the pool
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.user = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [results] = await connection.query("SELECT * FROM USERS");
            res.status(200).json({ users: results });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getUserIdByUsername = async (req, res) => {
    try {
        const username = req.body.username;
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query("SELECT user_id FROM USERS WHERE USERNAME = ?", [username]);
            // console.log(result)
            res.status(200).json(result);
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

