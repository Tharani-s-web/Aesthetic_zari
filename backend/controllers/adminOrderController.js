const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const User = require("../models/User");
const Address = require("../models/Address");
const ProductSize = require("../models/ProductSize");

// ==========================================
// UPDATE ORDER STATUS (ADMIN ONLY)
// ==========================================

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const { order_status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!order_status) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
        allowed_statuses: allowedStatuses,
      });
    }

    const order = await Order.findOne({
      mysqlId: orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = order_status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order_id: orderId,
      order_status,
    });
  } catch (error) {
    console.error("ADMIN UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL ORDERS (ADMIN ONLY)
// ==========================================

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = [];

    for (const order of orders) {
      // Get customer
      const user = await User.findOne({
        mysqlId: order.userId,
      }).lean();

      // Count order items
      const totalItems =
        await OrderItem.countDocuments({
          orderId: order.mysqlId,
        });

      formattedOrders.push({
        id: order.mysqlId,
        order_number: order.orderNumber,
        subtotal: order.subtotal,
        shipping_charge: order.shippingCharge,
        total_amount: order.totalAmount,
        order_status: order.orderStatus,
        payment_status: order.paymentStatus,
        created_at: order.createdAt,

        user_id: user
          ? user.mysqlId
          : order.userId,

        customer_name: user
          ? user.name
          : null,

        customer_email: user
          ? user.email
          : null,

        total_items: totalItems,
      });
    }

    return res.status(200).json({
      success: true,
      total_orders: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};


// ==========================================
// GET SINGLE ORDER DETAILS (ADMIN ONLY)
// ==========================================

const getAdminOrderDetails = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    // ==========================================
    // GET ORDER
    // ==========================================

    const order = await Order.findOne({
      mysqlId: orderId,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // GET CUSTOMER
    // ==========================================

    const user = await User.findOne({
      mysqlId: order.userId,
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ==========================================
    // GET DELIVERY ADDRESS
    // ==========================================

    const address = await Address.findOne({
      mysqlId: order.addressId,
    }).lean();

    // ==========================================
    // GET ORDER ITEMS
    // ==========================================

    const orderItems = await OrderItem.find({
      orderId,
    })
      .sort({ mysqlId: 1 })
      .lean();

    const formattedItems = [];

    for (const item of orderItems) {
      let sizeName = null;

      if (item.sizeId) {
        const size = await ProductSize.findOne({
          mysqlId: item.sizeId,
        }).lean();

        if (size) {
          sizeName = size.sizeName;
        }
      }

      let customizationData = {};

      try {
        if (item.customizationData) {
          customizationData =
            typeof item.customizationData === "string"
              ? JSON.parse(item.customizationData)
              : item.customizationData;
        }
      } catch (error) {
        customizationData = {};
      }

      formattedItems.push({
        order_item_id: item.mysqlId,
        product_id: item.productId,
        size_id: item.sizeId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        customization_data: customizationData,
        size_name: sizeName,
      });
    }

    // ==========================================
    // FORMAT RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      order: {
        id: order.mysqlId,
        order_number: order.orderNumber,
        subtotal: order.subtotal,
        shipping_charge: order.shippingCharge,
        total_amount: order.totalAmount,
        order_status: order.orderStatus,
        payment_status: order.paymentStatus,
        created_at: order.createdAt,
        updated_at: order.updatedAt,

        user_id: user.mysqlId,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: user.phone,

        delivery_name: address
          ? address.fullName
          : null,

        delivery_phone: address
          ? address.phone
          : null,

        address_line1: address
          ? address.addressLine1
          : null,

        address_line2: address
          ? address.addressLine2
          : null,

        city: address
          ? address.city
          : null,

        state: address
          ? address.state
          : null,

        pincode: address
          ? address.pincode
          : null,

        landmark: address
          ? address.landmark
          : null,

        items: formattedItems,
      },
    });
  } catch (error) {
    console.error(
      "GET ADMIN ORDER DETAILS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};


module.exports = {
  updateOrderStatus,
  getAllOrders,
  getAdminOrderDetails,
};