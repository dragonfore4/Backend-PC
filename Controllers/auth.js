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
                // "SELECT * FROM use WHERE username = ?",
                "SELECT * FROM users WHERE username = ?",
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
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // true in production for HTTPS
                sameSite: "none", // Allows cross-origin cookies
                maxAge: 4 * 60 * 60 * 1000, // 4 hours
                // domain: process.env.FRONTEND_DOMAIN// Use this specific domain for Vercel
            });
            // res.cookie("token", token, {
            //     httpOnly: true,
            //     secure: process.env.NODE_ENV === 'production', // true in production for HTTPS
            //     sameSite: "none", // Allows cross-origin cookies
            //     maxAge: 4 * 60 * 60 * 1000, // 4 hours
            // });
            
            

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
                "SELECT username FROM users WHERE username = ?",
                [username]
            );
            const [rowsEmail] = await connection.query(
                "SELECT email FROM user WHERE email = ?",
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
            const [results] = await connection.query("SELECT * FROM users");
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
            const [result] = await connection.query("SELECT user_id FROM user WHERE USERNAME = ?", [username]);
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

exports.getToken = async (req, res) => {
    const token = req.cookies.token; // Retrieve token from cookies
    if (!token) {
        return res.status(200).json({ message: "No token found" });
    }

    try {
        return res.status(200).json({ token: token }); // Return token as an object
    } catch (err) {
        console.error("Token retrieval failed:", err);
        return res.status(500).json({ message: "Server error" });
    }
};


exports.decodeToken = async (req, res) => {
    const token = req.cookies.token;
    console.log(req.cookies.token)

    if (!token) {
        return res.status(200).json({ message: "No token found" });
    }

    try {
        const decodeToken = jwt.verify(token, secretKey);
        return res.status(200).json(decodeToken);
    } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(401).json({ message: "Invalid token" });
    }
};

exports.deleteToken = async (req, res) => {
    const token = req.cookies.token; // Retrieve token from cookies
    console.log(token)

    if (!token) {
        return res.status(200).json({ message: "No token found" });
    }

    try {
        // Verify the token
        // return res.status(200).json({ authenticated: true, user: decoded });
        return res.clearCookie("token",{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in production for HTTPS
            sameSite: "none", // Allows cross-origin cookies
            maxAge: 0, // 4 hours
        }).status(200).json({ message: "Token deleted" });
    } catch (err) {
        // return res.status(401).json({ authenticated: false, message: "Invalid token" });
        return res.status(500).json({ message: "Internal server error" });
    }
};
