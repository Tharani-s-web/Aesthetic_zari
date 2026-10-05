const express = require("express");

const {
  getProductSizes,
  addProductSize,
} = require("../controllers/productSizeController");

const router = express.Router();

// Get sizes of a product
router.get("/:productId", getProductSizes);

// Add size to a product
router.post("/:productId", addProductSize);

module.exports = router;