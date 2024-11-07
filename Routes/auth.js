const express = require("express");

const router = express.Router();
const { register , login , user, getUserIdByUsername, getToken, decodeToken, deleteToken } = require("../Controllers/auth");
const { auth } = require("../Middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/user", auth, user);
router.post("/getUserIdByUsername", auth, getUserIdByUsername)
router.get("/getToken", getToken);
router.get("/decodeToken", decodeToken);
router.get("/deleteToken", deleteToken);


module.exports = router;