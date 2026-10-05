require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const ProductImage = require("../models/ProductImage");

const migrateProductImages = async () => {
  try {
    await connectMongoDB();

    console.log("Starting product image migration...");

    const query = `
      SELECT
        id,
        product_id,
        image_url,
        is_primary,
        created_at
      FROM product_images
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Product Image Fetch Error:", error);
        process.exit(1);
      }

      console.log(
        `Found ${results.length} product images in MySQL.`
      );

      let migratedCount = 0;
      let skippedCount = 0;

      for (const image of results) {
        try {
          const existingImage = await ProductImage.findOne({
            mysqlId: image.id,
          });

          if (existingImage) {
            console.log(
              `Skipping image "${image.image_url}" - already migrated.`
            );

            skippedCount++;
            continue;
          }

          await ProductImage.create({
            mysqlId: image.id,
            productId: image.product_id,
            imageUrl: image.image_url,
            isPrimary: Boolean(image.is_primary),
            createdAt: image.created_at,
          });

          console.log(
            `Migrated: ${image.image_url} → Product ID ${image.product_id}`
          );

          migratedCount++;
        } catch (imageError) {
          console.error(
            `Failed to migrate image "${image.image_url}":`,
            imageError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Product Image Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(
        `Total MySQL Product Images: ${results.length}`
      );
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error(
      "Product Image Migration Failed:",
      error
    );

    process.exit(1);
  }
};

migrateProductImages();