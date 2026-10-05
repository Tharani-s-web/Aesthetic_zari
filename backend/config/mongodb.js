const mongoose = require("mongoose");

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Database Connected Successfully");
    console.log("MongoDB Database Name:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
  }
};

module.exports = connectMongoDB;