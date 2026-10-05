const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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

    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },

    paymentGateway: {
      type: String,
      default: "",
      trim: true,
    },

    transactionId: {
      type: String,
      default: "",
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      required: true,
      trim: true,
    },

    paidAt: {
      type: Date,
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

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;