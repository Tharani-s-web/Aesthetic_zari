const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderDetails,
  getOrderTracking,
  updatePaymentStatus,
} = require("../controllers/orderController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Create order from cart
router.post("/checkout", authenticateToken, createOrder);
//get
router.get("/", authenticateToken, getMyOrders);
//update order status
router.put(
  "/:orderId/payment-status",
  authenticateToken,
  updatePaymentStatus
);
//get order tracking
router.get("/:orderId/tracking", authenticateToken, getOrderTracking);
//single order details
router.get("/:orderId", authenticateToken, getOrderDetails);

module.exports = router;