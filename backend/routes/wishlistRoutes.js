const express = require("express");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/",authenticateToken,getWishlist);
// Add product to wishlist
router.post("/", authenticateToken, addToWishlist);
//remove
router.delete(
    "/:wishlistItemId",
    authenticateToken,
    removeFromWishlist
)

module.exports = router;