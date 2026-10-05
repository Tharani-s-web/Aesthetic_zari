const mongoose = require("mongoose");

const orderTrackingSchema = new mongoose.Schema(
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

    status: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

const OrderTracking = mongoose.model(
  "OrderTracking",
  orderTrackingSchema
);

module.exports = OrderTracking;