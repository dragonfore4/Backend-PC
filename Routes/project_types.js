const express = require("express");

const router = express.Router();

// Middleware
const { auth } = require("../Middleware/auth");
const { list } = require("../Controllers/project_types");

router.get("/project_types", list)




module.exports = router;