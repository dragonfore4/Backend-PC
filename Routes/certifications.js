const express = require("express");

const router = express.Router();

// Middleware
const { auth } = require("../Middleware/auth");
const { list, read } = require("../Controllers/certifications");

router.get("/certifications", list)
router.get("/certification/:id", read)




module.exports = router;