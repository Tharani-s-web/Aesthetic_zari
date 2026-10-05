require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const Category = require("../models/Category");

const migrateCategories = async () => {
  try {
    await connectMongoDB();

    console.log("Starting category migration...");

    const query = `
      SELECT
        id,
        name,
        slug,
        description,
        image_url,
        is_active,
        created_at
      FROM categories
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Category Fetch Error:", error);
        process.exit(1);
      }

      console.log(`Found ${results.length} categories in MySQL.`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const category of results) {
        try {
          const existingCategory = await Category.findOne({
            mysqlId: category.id,
          });

          if (existingCategory) {
            console.log(
              `Skipping category "${category.name}" - already migrated.`
            );

            skippedCount++;
            continue;
          }

          await Category.create({
            mysqlId: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description || "",
            imageUrl: category.image_url || "",
            isActive: Boolean(category.is_active),
            createdAt: category.created_at,
          });

          console.log(`Migrated: ${category.name}`);

          migratedCount++;
        } catch (categoryError) {
          console.error(
            `Failed to migrate category "${category.name}":`,
            categoryError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Category Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(`Total MySQL Categories: ${results.length}`);
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error("Category Migration Failed:", error);

    process.exit(1);
  }
};

migrateCategories();