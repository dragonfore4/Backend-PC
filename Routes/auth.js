const express = require("express");

const router = express.Router();
const { register , login , user, getUserIdByUsername } = require("../Controllers/auth");
const { auth } = require("../Middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/user", auth, user);
router.post("/getUserIdByUsername", auth, getUserIdByUsername)


module.exports = router;