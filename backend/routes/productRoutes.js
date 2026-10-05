const express = require("express");

const {
  getProducts,
  getAllProductsAdmin,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getCompleteProductDetails,
  getCompleteProductDetailsBySlug,
  createProduct,
  updateProduct,
  toggleProductAvailability,
} = require("../controllers/productController");

const router = express.Router();

// ==========================================
// GET ALL PRODUCTS
// ==========================================

router.get("/", getProducts);

router.get("/admin/all", getAllProductsAdmin);

// ==========================================
// GET PRODUCTS BY CATEGORY
// ==========================================

router.get(
  "/category/:id",
  getProductsByCategory
);

// ==========================================
// GET COMPLETE PRODUCT DETAILS BY SLUG
// IMPORTANT: Must come before "/:id/details"
// ==========================================

router.get(
  "/slug/:slug/details",
  getCompleteProductDetailsBySlug
);

// ==========================================
// GET SINGLE PRODUCT BY SLUG
// IMPORTANT: Must come before "/:id"
// ==========================================

router.get(
  "/slug/:slug",
  getProductBySlug
);

// ==========================================
// GET COMPLETE PRODUCT DETAILS BY ID
// ==========================================

router.get(
  "/:id/details",
  getCompleteProductDetails
);

// ==========================================
// TOGGLE PRODUCT AVAILABILITY
// ==========================================

router.put(
  "/:id/toggle-availability",
  toggleProductAvailability
);

// ==========================================
// GET SINGLE PRODUCT BY ID
// ==========================================

router.get(
  "/:id",
  getProductById
);

// ==========================================
// CREATE PRODUCT
// ==========================================

router.post(
  "/",
  createProduct
);

// ==========================================
// UPDATE PRODUCT
// ==========================================

router.put(
  "/:id",
  updateProduct
);

module.exports = router;