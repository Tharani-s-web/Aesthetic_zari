const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const OrderTracking = require("../models/OrderTracking");
const Address = require("../models/Address");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const ProductSize = require("../models/ProductSize");
const ProductImage = require("../models/ProductImage");

// ==========================================
// CREATE ORDER FROM CART
// ==========================================

const createOrder = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { address_id, payment_method } = req.body;

    const allowedPaymentMethods = ["cod", "online"];

    // Validate payment method
    if (!payment_method) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    if (!allowedPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Validate address
    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    const addressId = Number(address_id);

    // ==========================================
    // STEP 1: VERIFY ADDRESS BELONGS TO USER
    // ==========================================

    const address = await Address.findOne({
      mysqlId: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found or access denied",
      });
    }

    // ==========================================
    // STEP 2: GET USER CART
    // ==========================================

    const cart = await Cart.findOne({
      userId,
    });

    if (!cart) {
      return res.status(400).json({
        success: false,
        message: "Cart not found",
      });
    }

    // ==========================================
    // STEP 3: GET CART ITEMS
    // ==========================================

    const cartItems = await CartItem.find({
      cartId: cart.mysqlId,
    }).lean();

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ==========================================
    // GET PRODUCT NAMES
    // ==========================================

    const formattedCartItems = [];

    for (const item of cartItems) {
      const product = await Product.findOne({
        mysqlId: item.productId,
      }).lean();

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found for cart item ${item.mysqlId}`,
        });
      }

      formattedCartItems.push({
        ...item,
        productName: product.name,
      });
    }

    // ==========================================
    // STEP 4: CALCULATE ORDER TOTAL
    // ==========================================

    const subtotal = formattedCartItems.reduce(
      (total, item) => {
        return (
          total +
          Number(item.price) * Number(item.quantity)
        );
      },
      0
    );

    // Currently free shipping
    const shippingCharge = 0;

    const totalAmount =
      subtotal + shippingCharge;

    // ==========================================
    // STEP 5: GENERATE ORDER NUMBER
    // ==========================================

    const orderNumber = `AZ-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // ==========================================
    // GENERATE NEXT ORDER MYSQL ID
    // ==========================================

    const lastOrder = await Order.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const orderMysqlId = lastOrder
      ? Number(lastOrder.mysqlId) + 1
      : 1;

    // ==========================================
    // STEP 6: CREATE ORDER
    // ==========================================

    const order = await Order.create({
      mysqlId: orderMysqlId,
      orderNumber,
      userId,
      addressId,
      subtotal,
      shippingCharge,
      totalAmount,
      orderStatus: "pending",
      paymentStatus: "pending",
      paymentMethod: payment_method,
    });

    // ==========================================
    // STEP 7: PREPARE ORDER ITEMS
    // ==========================================

    const lastOrderItem = await OrderItem.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    let nextOrderItemId = lastOrderItem
      ? Number(lastOrderItem.mysqlId) + 1
      : 1;

    const orderItemsToCreate =
      formattedCartItems.map((item) => {
        let customizationData = {};

        try {
          if (item.customizationData) {
            customizationData =
              typeof item.customizationData === "string"
                ? JSON.parse(item.customizationData)
                : item.customizationData;
          }
        } catch (error) {
          console.error(
            "Invalid customization data:",
            error
          );

          customizationData = {};
        }

        const orderItem = {
          mysqlId: nextOrderItemId++,
          orderId: order.mysqlId,
          productId: item.productId,
          sizeId: item.sizeId || null,
          productName: item.productName,
          quantity: Number(item.quantity),
          price: Number(item.price),
          customizationData,
        };

        return orderItem;
      });

    // ==========================================
    // STEP 8: INSERT ORDER ITEMS
    // ==========================================

    await OrderItem.insertMany(
      orderItemsToCreate
    );

    // ==========================================
    // STEP 9: CREATE INITIAL TRACKING RECORD
    // ==========================================

    const lastTracking = await OrderTracking.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const trackingMysqlId = lastTracking
      ? Number(lastTracking.mysqlId) + 1
      : 1;

    await OrderTracking.create({
      mysqlId: trackingMysqlId,
      orderId: order.mysqlId,
      status: "pending",
      message: "Order placed successfully",
    });

    // ==========================================
    // STEP 10: CLEAR CART
    // ==========================================

    await CartItem.deleteMany({
      cartId: cart.mysqlId,
    });

    // ==========================================
    // STEP 11: SUCCESS RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order.mysqlId,
        order_number: order.orderNumber,
        subtotal: order.subtotal,
        shipping_charge: order.shippingCharge,
        total_amount: order.totalAmount,
        order_status: order.orderStatus,
        payment_status: order.paymentStatus,
        payment_method: order.paymentMethod,
      },
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};


// ==========================================
// GET LOGGED-IN USER'S ORDERS
// ==========================================

const getMyOrders = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const orders = await Order.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = [];

    for (const order of orders) {
      const totalItems = await OrderItem.countDocuments({
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
        total_items: totalItems,
      });
    }

    return res.status(200).json({
      success: true,
      total_orders: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};


// ==========================================
// GET SINGLE ORDER DETAILS
// ==========================================

const getOrderDetails = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const orderId = Number(req.params.orderId);

    // ==========================================
    // GET ORDER
    // ==========================================

    const order = await Order.findOne({
      mysqlId: orderId,
      userId,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or access denied",
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
      // Get size
      let sizeName = null;

      if (item.sizeId) {
        const size = await ProductSize.findOne({
          mysqlId: item.sizeId,
        }).lean();

        if (size) {
          sizeName = size.sizeName;
        }
      }

      // Get primary product image
      const productImage =
        await ProductImage.findOne({
          productId: item.productId,
          isPrimary: true,
        })
          .sort({ mysqlId: 1 })
          .lean();

      // If no primary image, get first image
      const fallbackImage =
        productImage ||
        (await ProductImage.findOne({
          productId: item.productId,
        })
          .sort({ mysqlId: 1 })
          .lean());

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
        product_image: fallbackImage
          ? fallbackImage.imageUrl
          : null,
      });
    }

    // ==========================================
    // FORMAT ADDRESS
    // ==========================================

    const formattedAddress = address
      ? {
          full_name: address.fullName,
          phone: address.phone,
          address_line1: address.addressLine1,
          address_line2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          landmark: address.landmark,
        }
      : {};

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

        ...formattedAddress,

        items: formattedItems,
      },
    });
  } catch (error) {
    console.error("GET ORDER DETAILS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};


// ==========================================
// GET ORDER TRACKING HISTORY
// ==========================================

const getOrderTracking = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const orderId = Number(req.params.orderId);

    // Verify order belongs to user
    const order = await Order.findOne({
      mysqlId: orderId,
      userId,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or access denied",
      });
    }

    // Get tracking history
    const trackingRecords =
      await OrderTracking.find({
        orderId,
      })
        .sort({ createdAt: 1 })
        .lean();

    const formattedTracking =
      trackingRecords.map((tracking) => ({
        id: tracking.mysqlId,
        order_id: tracking.orderId,
        status: tracking.status,
        message: tracking.message,
        created_at: tracking.createdAt,
      }));

    return res.status(200).json({
      success: true,
      order_number: order.orderNumber,
      current_status: order.orderStatus,
      payment_status: order.paymentStatus,
      order_created_at: order.createdAt,
      last_updated_at: order.updatedAt,
      tracking: formattedTracking,
    });
  } catch (error) {
    console.error("GET ORDER TRACKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order tracking",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE ORDER STATUS + TRACKING HISTORY
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

    // ==========================================
    // VALIDATE STATUS
    // ==========================================

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

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Order.findOne({
      mysqlId: orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    order.orderStatus = order_status;

    await order.save();

    // ==========================================
    // STATUS MESSAGES
    // ==========================================

    const statusMessages = {
      pending:
        "Order is pending confirmation",

      confirmed:
        "Order confirmed successfully",

      processing:
        "Your order is being prepared",

      shipped:
        "Your order has been shipped",

      delivered:
        "Order delivered successfully",

      cancelled:
        "Order has been cancelled",
    };

    // ==========================================
    // CREATE TRACKING HISTORY
    // ==========================================

    const lastTracking =
      await OrderTracking.findOne()
        .sort({ mysqlId: -1 })
        .lean();

    const newTrackingId = lastTracking
      ? Number(lastTracking.mysqlId) + 1
      : 1;

    await OrderTracking.create({
      mysqlId: newTrackingId,
      orderId,
      status: order_status,
      message: statusMessages[order_status],
    });

    return res.status(200).json({
      success: true,
      message:
        "Order status and tracking history updated successfully",
      order_id: orderId,
      order_status,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE PAYMENT STATUS
// ==========================================

const updatePaymentStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const { payment_status } = req.body;

    const allowedPaymentStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    // ==========================================
    // VALIDATE PAYMENT STATUS
    // ==========================================

    if (!payment_status) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    if (
      !allowedPaymentStatuses.includes(
        payment_status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
        allowed_statuses:
          allowedPaymentStatuses,
      });
    }

    // ==========================================
    // UPDATE PAYMENT STATUS
    // ==========================================

    const order = await Order.findOne({
      mysqlId: orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = payment_status;

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Payment status updated successfully",
      order_id: orderId,
      payment_status,
    });
  } catch (error) {
    console.error(
      "UPDATE PAYMENT STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};


// ==========================================
// ADMIN ORDER CONTROLLERS
// ==========================================
//
// These are loaded only when called.
// This prevents adminOrderController.js from
// loading MySQL during normal server startup.
// We will migrate adminOrderController.js separately.
//

const getAllOrders = (...args) => {
  const adminOrderController = require("./adminOrderController");

  return adminOrderController.getAllOrders(...args);
};

const getAdminOrderDetails = (...args) => {
  const adminOrderController = require("./adminOrderController");

  return adminOrderController.getAdminOrderDetails(...args);
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
  getOrderTracking,
  getAllOrders,
  getAdminOrderDetails,
  updateOrderStatus,
  updatePaymentStatus,
};