const express = require("express");

const router = express.Router();

// Middleware
const { auth } = require("../Middleware/auth");
const { list, read, readByName } = require("../Controllers/project_images");

router.get("/project_images", list)
router.get("/project_images/:id", read)
router.get("/project_imagesByName/:name", readByName)




module.exports = router;