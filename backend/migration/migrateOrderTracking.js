require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const OrderTracking = require("../models/OrderTracking");

const migrateOrderTracking = async () => {
  try {
    await connectMongoDB();

    console.log("Starting order tracking migration...");

    const query = `
      SELECT
        id,
        order_id,
        status,
        message,
        created_at
      FROM order_tracking
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Order Tracking Fetch Error:", error);
        process.exit(1);
      }

      console.log(
        `Found ${results.length} order tracking records in MySQL.`
      );

      let migratedCount = 0;
      let skippedCount = 0;

      for (const tracking of results) {
        try {
          const existingTracking = await OrderTracking.findOne({
            mysqlId: tracking.id,
          });

          if (existingTracking) {
            console.log(
              `Skipping tracking ID ${tracking.id} - already migrated.`
            );

            skippedCount++;
            continue;
          }

          await OrderTracking.create({
            mysqlId: tracking.id,
            orderId: tracking.order_id,
            status: tracking.status,
            message: tracking.message || "",
            createdAt: tracking.created_at,
          });

          console.log(
            `Migrated: Tracking ID ${tracking.id} → Order ID ${tracking.order_id}`
          );

          migratedCount++;
        } catch (trackingError) {
          console.error(
            `Failed to migrate tracking ID ${tracking.id}:`,
            trackingError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Order Tracking Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(
        `Total MySQL Order Tracking Records: ${results.length}`
      );
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error(
      "Order Tracking Migration Failed:",
      error
    );

    process.exit(1);
  }
};

migrateOrderTracking();