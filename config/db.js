const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
require("dotenv").config({path: ".env.local"});

// const connection = mysql.createConnection({
//     host : "localhost",
//     user : "root",
//     password : "1234",
//     database : "carbon_market"
// })


const pool = mysql.createPool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME
})




// module.exports = pool;
// exports = connectDB;
module.exports = {
    pool
};