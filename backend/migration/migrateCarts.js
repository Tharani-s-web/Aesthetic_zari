require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const Cart = require("../models/Cart");

const migrateCarts = async () => {
  try {
    await connectMongoDB();

    console.log("Starting cart migration...");

    const query = `
      SELECT
        id,
        user_id,
        created_at,
        updated_at
      FROM carts
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Cart Fetch Error:", error);
        process.exit(1);
      }

      console.log(`Found ${results.length} carts in MySQL.`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const cart of results) {
        try {
          const existingCart = await Cart.findOne({
            mysqlId: cart.id,
          });

          if (existingCart) {
            console.log(
              `Skipping cart ID ${cart.id} - already migrated.`
            );

            skippedCount++;
            continue;
          }

          await Cart.create({
            mysqlId: cart.id,
            userId: cart.user_id,
            createdAt: cart.created_at,
            updatedAt: cart.updated_at,
          });

          console.log(
            `Migrated: Cart ID ${cart.id} → User ID ${cart.user_id}`
          );

          migratedCount++;
        } catch (cartError) {
          console.error(
            `Failed to migrate cart ID ${cart.id}:`,
            cartError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Cart Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(`Total MySQL Carts: ${results.length}`);
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error("Cart Migration Failed:", error);
    process.exit(1);
  }
};

migrateCarts();