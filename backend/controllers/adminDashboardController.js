const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ==========================================
// ADMIN DASHBOARD ANALYTICS
// ==========================================

const getDashboardAnalytics = async (req, res) => {
  try {
    // ==========================================
    // DASHBOARD MAIN STATISTICS
    // ==========================================

    const totalCustomers = await User.countDocuments({
      role: "customer",
    });

    const totalProducts = await Product.countDocuments({});

    const totalOrders = await Order.countDocuments({});

    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    const pendingOrders = await Order.countDocuments({
      orderStatus: "pending",
    });

    // ==========================================
    // RECENT ORDERS
    // ==========================================

    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedRecentOrders = [];

    for (const order of recentOrders) {
      const user = await User.findOne({
        mysqlId: order.userId,
      }).lean();

      formattedRecentOrders.push({
        id: order.mysqlId,
        order_number: order.orderNumber,
        customer_name: user ? user.name : null,
        total_amount: order.totalAmount,
        order_status: order.orderStatus,
        payment_status: order.paymentStatus,
        created_at: order.createdAt,
      });
    }

    // ==========================================
    // ORDER STATUS SUMMARY
    // ==========================================

    const orderStatusSummary = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const formattedStatusSummary =
      orderStatusSummary.map((item) => ({
        order_status: item._id,
        count: item.count,
      }));

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      dashboard: {
        total_customers: totalCustomers,
        total_products: totalProducts,
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        pending_orders: pendingOrders,
      },

      recent_orders: formattedRecentOrders,

      order_status_summary:
        formattedStatusSummary,
    });
  } catch (error) {
    console.error(
      "GET DASHBOARD ANALYTICS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dashboard analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardAnalytics,
};