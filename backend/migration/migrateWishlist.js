require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const Wishlist = require("../models/Wishlist");

const migrateWishlist = async () => {
  try {
    await connectMongoDB();

    console.log("Starting wishlist migration...");

    const query = `
      SELECT
        id,
        user_id,
        product_id,
        created_at
      FROM wishlist
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Wishlist Fetch Error:", error);
        process.exit(1);
      }

      console.log(`Found ${results.length} wishlist items in MySQL.`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const item of results) {
        try {
          const existingItem = await Wishlist.findOne({
            mysqlId: item.id,
          });

          if (existingItem) {
            console.log(
              `Skipping wishlist ID ${item.id} - already migrated.`
            );

            skippedCount++;
            continue;
          }

          await Wishlist.create({
            mysqlId: item.id,
            userId: item.user_id,
            productId: item.product_id,
            createdAt: item.created_at,
          });

          console.log(
            `Migrated: Wishlist ID ${item.id} → User ID ${item.user_id}, Product ID ${item.product_id}`
          );

          migratedCount++;
        } catch (itemError) {
          console.error(
            `Failed to migrate wishlist ID ${item.id}:`,
            itemError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Wishlist Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(`Total MySQL Wishlist Items: ${results.length}`);
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error("Wishlist Migration Failed:", error);
    process.exit(1);
  }
};

migrateWishlist();