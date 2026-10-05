require("dotenv").config();
const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");

const Product = require("../models/Product");

const migrateProducts = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    console.log("Starting product migration...");

    // Get products from MySQL
    const query = `
      SELECT
        id,
        category_id,
        name,
        slug,
        description,
        base_price,
        is_customizable,
        stock_status,
        is_active
      FROM products
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Product Fetch Error:", error);
        process.exit(1);
      }

      console.log(`Found ${results.length} products in MySQL.`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const product of results) {
        try {
          // Check whether this product was already migrated
          const existingProduct = await Product.findOne({
            mysqlId: product.id,
          });

          if (existingProduct) {
            console.log(
              `Skipping product "${product.name}" - already migrated.`
            );

            skippedCount++;
            continue;
          }

          // Create MongoDB product
          await Product.create({
            mysqlId: product.id,
            categoryId: product.category_id,
            name: product.name,
            slug: product.slug,
            description: product.description || "",
            basePrice: Number(product.base_price),
            isCustomizable: Boolean(product.is_customizable),
            stockStatus: product.stock_status,
            isActive: Boolean(product.is_active),
          });

          console.log(`Migrated: ${product.name}`);

          migratedCount++;
        } catch (productError) {
          console.error(
            `Failed to migrate product "${product.name}":`,
            productError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Product Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(`Total MySQL Products: ${results.length}`);
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error("Product Migration Failed:", error);
    process.exit(1);
  }
};

migrateProducts();