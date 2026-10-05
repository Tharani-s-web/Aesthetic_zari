require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const CartItem = require("../models/CartItem");

const migrateCartItems = async () => {
  try {
    await connectMongoDB();

    console.log("Starting cart item migration...");

    const query = `
      SELECT
        id,
        cart_id,
        product_id,
        size_id,
        quantity,
        customization_data,
        price,
        created_at,
        updated_at
      FROM cart_items
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Cart Item Fetch Error:", error);
        process.exit(1);
      }

      console.log(
        `Found ${results.length} cart items in MySQL.`
      );

      let migratedCount = 0;
      let skippedCount = 0;

      for (const item of results) {
        try {
          const existingItem = await CartItem.findOne({
            mysqlId: item.id,
          });

          if (existingItem) {
            console.log(
              `Skipping cart item ID ${item.id} - already migrated.`
            );

            skippedCount++;
            continue;
          }

          let parsedCustomizationData = null;

          if (item.customization_data !== null) {
            try {
              parsedCustomizationData =
                typeof item.customization_data === "string"
                  ? JSON.parse(item.customization_data)
                  : item.customization_data;
            } catch (parseError) {
              console.error(
                `Could not parse customization data for cart item ${item.id}.`
              );

              parsedCustomizationData =
                item.customization_data;
            }
          }

          await CartItem.create({
            mysqlId: item.id,
            cartId: item.cart_id,
            productId: item.product_id,
            sizeId: item.size_id,
            quantity: Number(item.quantity),
            customizationData: parsedCustomizationData,
            price: Number(item.price),
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          });

          console.log(
            `Migrated: Cart Item ID ${item.id} → Product ID ${item.product_id}`
          );

          migratedCount++;
        } catch (itemError) {
          console.error(
            `Failed to migrate cart item ID ${item.id}:`,
            itemError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Cart Item Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(`Total MySQL Cart Items: ${results.length}`);
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error(
      "Cart Item Migration Failed:",
      error
    );

    process.exit(1);
  }
};

migrateCartItems();