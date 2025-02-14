require("dotenv").config({ path: ".env.local" });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const { readdirSync } = require("fs");
const { connectMG } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Start MongoDB connection
// connectMG();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev"));

// CORS Configuration
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL, // Your Vercel frontend URL
        "http://localhost:3000", // Localhost for development
    ],
    credentials: true,
};
app.use(cors(corsOptions));

// Load and apply routes dynamically
readdirSync("./Routes").forEach((file) => {
    try {
        const route = require(`./Routes/${file}`);
        if (route) {
            app.use("/api", route);
        } else {
            console.error(`Error: Route in file ${file} is undefined.`);
        }
    } catch (error) {
        console.error(`Failed to load route from file: ${file}`, error);
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
