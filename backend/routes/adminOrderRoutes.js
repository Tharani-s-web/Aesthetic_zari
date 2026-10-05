const express = require("express");

const {
  getAllOrders,
  getAdminOrderDetails,
  updateOrderStatus,
} = require("../controllers/orderController");

const authenticateToken = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ==========================================
// GET ALL ORDERS - ADMIN
// ==========================================

router.get(
  "/",
  authenticateToken,
  adminMiddleware,
  getAllOrders
);

// ==========================================
// GET SINGLE ORDER DETAILS - ADMIN
// ==========================================

router.get(
  "/:orderId",
  authenticateToken,
  adminMiddleware,
  getAdminOrderDetails
);

// ==========================================
// UPDATE ORDER STATUS - ADMIN
// ==========================================

router.put(
  "/:orderId/status",
  authenticateToken,
  adminMiddleware,
  updateOrderStatus
);

module.exports = router;