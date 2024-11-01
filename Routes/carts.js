const express = require("express");
const { addProjectToCart, getCartIdByUsername, getCartDetails, deleteProjectFromCart } = require("../Controllers/carts");
const { auth } = require("../Middleware/auth");

const router = express.Router();

router.post("/cart/:cartId/project", auth, addProjectToCart);  // Add product to cart
router.get("/cart/:cartId/details", getCartDetails);
router.get("/cart/username/:username", auth, getCartIdByUsername);  // Get cart ID by username
router.delete("/cart/:cartId/project/:projectId", auth, deleteProjectFromCart);  // Delete project from cart


module.exports = router;




