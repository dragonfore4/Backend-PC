const express = require("express");

const router = express.Router();

// Middleware
const { auth } = require("../Middleware/auth");
const { list, read,update,  listCarbonCreditByProjectId } = require("../Controllers/carboncredits");

router.get("/carboncredits", list)
router.patch("/carboncredits", update)
router.get("/carboncredits/:id", read)
router.get("/carboncredits/project/:project_id", listCarbonCreditByProjectId)




module.exports = router;