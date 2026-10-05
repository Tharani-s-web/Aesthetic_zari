const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const authenticateToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

// ==========================================
// ADMIN ORDER CONTROLLERS
// ==========================================

const {
  updateOrderStatus,
  getAllOrders,
  getAdminOrderDetails,
} = require("../controllers/adminOrderController");

// ==========================================
// ADMIN PRODUCT CONTROLLERS
// ==========================================

const {
  addProduct,
  updateProduct,
  deactivateProduct,
  activateProduct,
  addProductSize,
  updateProductSize,
  toggleProductSizeAvailability,
  deleteProductSize,
  uploadProductImages,
  getProductImages,
} = require("../controllers/adminProductController");

const {
  getAllCategories,
  addCategory,
  updateCategory,
} = require("../controllers/adminCategoryController");

const {
  getDashboardAnalytics,
} = require("../controllers/adminDashboardController");

const router = express.Router();


// ==========================================
// TEST ADMIN ACCESS
// ==========================================

router.get(
  "/test",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Admin! Access granted.",
      admin: {
        id: req.user.id,
        role: req.user.role,
      },
    });
  }
);


// ==========================================
// ADMIN ORDER MANAGEMENT
// ==========================================

// Get all orders
router.get(
  "/orders",
  authenticateToken,
  requireAdmin,
  getAllOrders
);


// Get single order details
router.get(
  "/orders/:orderId",
  authenticateToken,
  requireAdmin,
  getAdminOrderDetails
);


// Update order status
router.put(
  "/orders/:orderId/status",
  authenticateToken,
  requireAdmin,
  updateOrderStatus
);


// ==========================================
// ADMIN PRODUCT MANAGEMENT
// ==========================================

// Add new product
router.post(
  "/products",
  authenticateToken,
  requireAdmin,
  addProduct
);


// Update product
router.put(
  "/products/:productId",
  authenticateToken,
  requireAdmin,
  updateProduct
);

//deactivate product
router.patch("/products/:productId/deactivate",authenticateToken,requireAdmin,deactivateProduct);
//activate product
router.patch("/products/:productId/activate",authenticateToken,requireAdmin,activateProduct);
//add product size
router.post("/products/:productId/sizes", authenticateToken, requireAdmin,addProductSize);
//update prod size
router.put("/products/:productId/sizes/:sizeId", authenticateToken, requireAdmin, updateProductSize);
//enable/disable product size
router.patch("/products/:productId/sizes/:sizeId/toggle", authenticateToken, requireAdmin, toggleProductSizeAvailability);
//delete
router.delete("/products/:productId/sizes/:sizeId", authenticateToken, requireAdmin, deleteProductSize);
// ==========================================
// ADMIN CATEGORY MANAGEMENT
// ==========================================

// Get all categories
router.get(
  "/categories",
  authenticateToken,
  requireAdmin,
  getAllCategories
);
//add category
router.post("/categories", authenticateToken, requireAdmin, addCategory);
//update category
router.put("/categories/:categoryId", authenticateToken, requireAdmin, updateCategory);
//upload
router.post("/products/:productId/images",authenticateToken, requireAdmin, upload.array("images",5), uploadProductImages);
//get all images
router.get("/products/:productId/images", authenticateToken, requireAdmin, getProductImages);
//admin dashboard
router.get("/dashboard", authenticateToken, requireAdmin, getDashboardAnalytics);

module.exports = router;