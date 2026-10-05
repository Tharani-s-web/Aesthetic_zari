const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

// ===============================
// DATABASE CONNECTIONS
// ===============================

// MySQL


// MongoDB
const connectMongoDB = require("./config/mongodb");
connectMongoDB();


// ===============================
// ROUTES
// ===============================

const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const productSizeRoutes = require("./routes/productSizeRoutes");
const productImageRoutes = require("./routes/productImageRoutes");
const customizationRoutes = require("./routes/customizationRoutes");
const authRoutes = require("./routes/authRoutes");
const testProtectedRoutes = require("./routes/testProtectedRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const homepageSectionRoutes=require("./routes/homepageSectionRoutes");



const app = express();

const PORT = process.env.PORT || 5000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "../../aesthetic-zari-admin/public/uploads"
    )
  )
);


// ===============================
// ROUTES
// ===============================

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-sizes", productSizeRoutes);
app.use("/api/product-images", productImageRoutes);
app.use("/api/customization-fields", customizationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testProtectedRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/homepage-sections",homepageSectionRoutes);

// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Aesthetic Zari Backend is Running Successfully!",
  });
});


// ===============================
// MONGODB DATABASE TEST ROUTE
// ===============================

const mongoose = require("mongoose");

app.get("/api/test-db", (req, res) => {
  try {
    const readyState = mongoose.connection.readyState;

    if (readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: "MongoDB database is not connected",
      });
    }

    return res.status(200).json({
      success: true,
      message: "MongoDB database connection successful!",
      database: mongoose.connection.name,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "MongoDB database query failed",
      error: error.message,
    });
  }
});
// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});