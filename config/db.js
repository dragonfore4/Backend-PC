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
    host : "127.0.0.1",
    user : "root",
    password : "1234",
    database : process.env.DB_NAME
})

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/carbon_market") ;
        console.log("mongoose connected");
    } catch(err) {
        console.log(err);
    }
}


// module.exports = pool;
// exports = connectDB;
module.exports = {
    pool,
    connectMG : connectDB
};