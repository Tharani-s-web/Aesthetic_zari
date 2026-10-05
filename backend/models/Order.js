const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      required: true,
      unique: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    userId: {
      type: Number,
      required: true,
    },

    addressId: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    shippingCharge: {
      type: Number,
      required: true,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    orderStatus: {
      type: String,
      required: true,
      trim: true,
    },

    paymentStatus: {
      type: String,
      required: true,
      trim: true,
    },

    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;