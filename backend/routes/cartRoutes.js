const express = require("express");

const {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
} = require("../controllers/cartController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();
// Get logged-in user's cart
router.get("/", authenticateToken, getCart);

// Add item to cart (Protected)
router.post("/", authenticateToken, addToCart);

// Update cart item quantity
router.put("/:cartItemId", authenticateToken, updateCartItemQuantity);
// Remove cart item
router.delete("/:cartItemId", authenticateToken, removeCartItem);

module.exports = router;