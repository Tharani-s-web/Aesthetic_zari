require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");

const ProductSize = require("../models/ProductSize");

const migrateProductSizes = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    console.log("Starting product size migration...");

    // Get product sizes from MySQL
    const query = `
      SELECT
        id,
        product_id,
        size_name,
        price,
        is_available
      FROM product_sizes
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Product Size Fetch Error:", error);
        process.exit(1);
      }

      console.log(
        `Found ${results.length} product sizes in MySQL.`
      );

      let migratedCount = 0;
      let skippedCount = 0;

      for (const size of results) {
        try {
          // Check whether this size was already migrated
          const existingSize = await ProductSize.findOne({
            mysqlId: size.id,
          });

          if (existingSize) {
            console.log(
              `Skipping size "${size.size_name}" - already migrated.`
            );

            skippedCount++;
            continue;
          }

          // Create MongoDB product size
          await ProductSize.create({
            mysqlId: size.id,
            productId: size.product_id,
            sizeName: size.size_name,
            price: Number(size.price),
            isAvailable: Boolean(size.is_available),
          });

          console.log(
            `Migrated: ${size.size_name} → Product ID ${size.product_id}`
          );

          migratedCount++;
        } catch (sizeError) {
          console.error(
            `Failed to migrate size "${size.size_name}":`,
            sizeError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Product Size Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(`Total MySQL Product Sizes: ${results.length}`);
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error(
      "Product Size Migration Failed:",
      error
    );

    process.exit(1);
  }
};

migrateProductSizes();