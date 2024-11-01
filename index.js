const express = require("express");

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
        // Allow requests with no origin (like mobile apps or Postman) or allow any origin
        if (!origin) return callback(null, true);
        return callback(null, true); // Allow all origins
    },
    credentials: true, // Enable cookies to be sent with requests
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