const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
require("dotenv").config({path: ".env.local"});

// const connection = mysql.createConnection({
//     host : "localhost",
//     user : "root",
//     password : "1234",
//     database : "carbon_market"
// })

// mysql://root:RORUgYrGpNfrluALtBEkjJMVgFWjJSTo@junction.proxy.rlwy.net:25591/railway
const pool = mysql.createPool({
    host : process.env.DB_HOST || 'localhost',
    user : process.env.DB_USER || 'root',
    password : process.env.DB_PASSWORD || '1234',
    database : process.env.DB_NAME || 'carbon_credit_db',
    port: process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: true

    }
})




// module.exports = pool;
// exports = connectDB;
module.exports = {
    pool
};