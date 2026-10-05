const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      required: true,
      unique: true,
    },

    orderId: {
      type: Number,
      required: true,
    },

    productId: {
      type: Number,
      required: true,
    },

    sizeId: {
      type: Number,
      default: null,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    customizationData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

module.exports = OrderItem;