const User = require("../models/User");

// ==========================================
// GET LOGGED-IN USER PROFILE
// ==========================================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      mysqlId: userId,
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.mysqlId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GET USER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
};