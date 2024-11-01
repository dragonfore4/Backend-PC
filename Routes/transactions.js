const express = require("express");
const { auth } = require("../Middleware/auth");
const { checkOut, getTransaction, listTransactions } = require("../Controllers/transactions");

const router = express.Router();

// router.post("/checkout", auth, checkOut );
router.post("/checkout" , checkOut );
router.get("/transaction/:id", getTransaction);
router.get("/transactions", listTransactions);



module.exports = router;
