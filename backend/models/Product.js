const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Original MySQL product ID
    mysqlId: {
      type: Number,
      required: true,
      unique: true,
    },

    categoryId: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    basePrice: {
      type: Number,
      required: true,
    },

    isCustomizable: {
      type: Boolean,
      default: true,
    },

    stockStatus: {
      type: String,
      enum: ["available", "out_of_stock"],
      default: "available",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;