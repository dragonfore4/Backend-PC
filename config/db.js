const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: true

    }
})

module.exports = {
    pool
};