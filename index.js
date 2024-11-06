const express = require("express");
require("dotenv").config({path: ".env.local"});

const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path")

const { connectMG } = require("./config/db")

const { readdirSync}  = require("fs")

const app = express();

// start mongodb
// connectMG();

app.use(bodyParser.urlencoded({ extended: false }))
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTENDURL, // Your Vercel frontend URL
            'http://localhost:3000', // Localhost for development
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};


// Apply CORS middleware to all routes
app.use(cors(corsOptions));
app.use(morgan("dev"))
app.use(bodyParser.json())

// app.use(express.static(path.join(__dirname, "uploads")))

const files = readdirSync("./Routes")
files.forEach(f => {
    app.use("/api", require("./Routes/"+f));
})


const port = 5000;

app.listen(port, () => {
    console.log(`Server running in port ${port}`)
})