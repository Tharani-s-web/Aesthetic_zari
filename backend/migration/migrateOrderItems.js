require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const OrderItem = require("../models/OrderItem");

const migrateOrderItems = async () => {
  try {
    await connectMongoDB();

    console.log("Starting order item migration...");

    const query = `
      SELECT
        id,
        order_id,
        product_id,
        size_id,
        product_name,
        quantity,
        price,
        customization_data,
        created_at
      FROM order_items
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Order Item Fetch Error:", error);
        process.exit(1);
      }

      console.log(`Found ${results.length} order items in MySQL.`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const item of results) {
        try {
          const existingItem = await OrderItem.findOne({
            mysqlId: item.id,
          });

          if (existingItem) {
            console.log(
              `Skipping order item ID ${item.id} - already migrated.`
            );

            skippedCount++;
            continue;
          }

          let customizationData = null;

          if (item.customization_data) {
            try {
              customizationData =
                typeof item.customization_data === "string"
                  ? JSON.parse(item.customization_data)
                  : item.customization_data;
            } catch (parseError) {
              console.log(
                `Could not parse customization data for order item ID ${item.id}. Storing as text.`
              );

              customizationData = item.customization_data;
            }
          }

          await OrderItem.create({
            mysqlId: item.id,
            orderId: item.order_id,
            productId: item.product_id,
            sizeId: item.size_id ?? null,
            productName: item.product_name,
            quantity: Number(item.quantity),
            price: Number(item.price),
            customizationData: customizationData,
            createdAt: item.created_at,
          });

          console.log(
            `Migrated: Order Item ID ${item.id} → Order ID ${item.order_id}`
          );

          migratedCount++;
        } catch (itemError) {
          console.error(
            `Failed to migrate order item ID ${item.id}:`,
            itemError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Order Item Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(`Total MySQL Order Items: ${results.length}`);
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error("Order Item Migration Failed:", error);

    process.exit(1);
  }
};

migrateOrderItems();