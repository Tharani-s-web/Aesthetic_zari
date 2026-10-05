const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const mysql = require("mysql2/promise");

const User = require("../models/User");

// ==========================================
// MYSQL CONNECTION
// ==========================================

const mysqlConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ==========================================
// MIGRATE USERS
// ==========================================

const migrateUsers = async () => {
  try {
    // ==========================================
    // CONNECT TO MONGODB
    // ==========================================

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected Successfully");

    // ==========================================
    // GET USERS FROM MYSQL
    // ==========================================

    console.log("Fetching users from MySQL...");

    const [users] = await mysqlConnection.query(`
      SELECT
        id,
        name,
        email,
        phone,
        password,
        role
      FROM users
    `);

    console.log(`Found ${users.length} users in MySQL`);

    // ==========================================
    // UPDATE / MIGRATE USERS TO MONGODB
    // ==========================================

    for (const user of users) {
      const existingUser = await User.findOne({
        email: user.email,
      });

      if (existingUser) {
        // Update existing MongoDB user
        await User.updateOne(
          { email: user.email },
          {
            $set: {
              mysqlId: user.id,
              name: user.name,
              phone: user.phone || "",
              password: user.password,
              role: user.role || "customer",
            },
          }
        );

        console.log(
          `Updated: ${user.email} → mysqlId: ${user.id}`
        );

        continue;
      }

      // Create user if it doesn't exist
      await User.create({
        mysqlId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        password: user.password,
        role: user.role || "customer",
      });

      console.log(
        `Migrated: ${user.email} → mysqlId: ${user.id}`
      );
    }

    console.log("=================================");
    console.log("User migration completed!");
    console.log("=================================");

  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    await mysqlConnection.end();

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    console.log("Database connections closed.");
  }
};

// ==========================================
// START MIGRATION
// ==========================================

migrateUsers();