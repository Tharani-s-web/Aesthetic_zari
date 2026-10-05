const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// ==========================================
// USER SIGNUP
// ==========================================

const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check if email already exists in MongoDB
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new MongoDB user
    const lastUser = await User.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const nextMysqlId = lastUser
      ? Number(lastUser.mysqlId) + 1
      : 1;

    const newUser = await User.create({
      mysqlId: nextMysqlId,
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      password: hashedPassword,
      role: "customer",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      userId: newUser._id,
    });

  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Signup failed",
      error: error.message,
    });
  }
};

// ==========================================
// USER LOGIN
// ==========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user in MongoDB
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ------------------------------------------
    // JWT USER ID
    // ------------------------------------------
    // Migrated users have their old MySQL ID.
    // New MongoDB users don't have mysqlId yet.
    //
    // We temporarily use MongoDB _id for new users.
    // Existing migrated users continue using mysqlId.
    // ------------------------------------------

    const tokenUserId = user.mysqlId;

    // Create JWT
    const token = jwt.sign(
      {
        id: tokenUserId,
        mongoId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: tokenUserId,
        mongoId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  signup,
  login,
};