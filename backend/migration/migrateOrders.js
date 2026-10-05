require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const Order = require("../models/Order");

const migrateOrders = async () => {
  try {
    await connectMongoDB();

    console.log("Starting order migration...");

    const query = `
      SELECT
        id,
        order_number,
        user_id,
        address_id,
        subtotal,
        shipping_charge,
        total_amount,
        order_status,
        payment_status,
        payment_method,
        created_at,
        updated_at
      FROM orders
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Order Fetch Error:", error);
        process.exit(1);
      }

      console.log(`Found ${results.length} orders in MySQL.`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const order of results) {
        try {
          const existingOrder = await Order.findOne({
            mysqlId: order.id,
          });

          if (existingOrder) {
            console.log(
              `Skipping order ID ${order.id} - already migrated.`
            );

            skippedCount++;
            continue;
          }

          await Order.create({
            mysqlId: order.id,
            orderNumber: order.order_number,
            userId: order.user_id,
            addressId: order.address_id,
            subtotal: Number(order.subtotal),
            shippingCharge: Number(order.shipping_charge),
            totalAmount: Number(order.total_amount),
            orderStatus: order.order_status,
            paymentStatus: order.payment_status,
            paymentMethod: order.payment_method,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
          });

          console.log(
            `Migrated: Order ${order.order_number} → User ID ${order.user_id}`
          );

          migratedCount++;
        } catch (orderError) {
          console.error(
            `Failed to migrate order ID ${order.id}:`,
            orderError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Order Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(`Total MySQL Orders: ${results.length}`);
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error("Order Migration Failed:", error);
    process.exit(1);
  }
};

migrateOrders();