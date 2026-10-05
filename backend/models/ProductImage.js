const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      required: true,
      unique: true,
    },

    productId: {
      type: Number,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

const ProductImage = mongoose.model(
  "ProductImage",
  productImageSchema
);

module.exports = ProductImage;