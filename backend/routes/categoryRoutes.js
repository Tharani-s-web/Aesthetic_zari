const express = require("express");

const {
  getCategories,
  createCategory,
  updateCategory,
} = require("../controllers/categoryController");

const router = express.Router();

// Get all categories
router.get("/", getCategories);

// Create category
router.post("/", createCategory);

// Update category
router.put("/:id", updateCategory);

module.exports = router;