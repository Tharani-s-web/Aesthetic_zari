require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const CustomizationField = require("../models/CustomizationField");

const migrateCustomizationFields = async () => {
  try {
    await connectMongoDB();

    console.log("Starting customization field migration...");

    const query = `
      SELECT
        id,
        product_id,
        field_name,
        field_label,
        field_type,
        placeholder,
        options,
        is_required,
        display_order,
        created_at
      FROM product_customization_fields
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error(
          "MySQL Customization Field Fetch Error:",
          error
        );
        process.exit(1);
      }

      console.log(
        `Found ${results.length} customization fields in MySQL.`
      );

      let migratedCount = 0;
      let skippedCount = 0;

      for (const field of results) {
        try {
          const existingField =
            await CustomizationField.findOne({
              mysqlId: field.id,
            });

          if (existingField) {
            console.log(
              `Skipping field "${field.field_name}" - already migrated.`
            );

            skippedCount++;
            continue;
          }

          let parsedOptions = null;

          if (field.options !== null) {
            try {
              parsedOptions =
                typeof field.options === "string"
                  ? JSON.parse(field.options)
                  : field.options;
            } catch (parseError) {
              console.error(
                `Could not parse options for "${field.field_name}".`
              );

              parsedOptions = field.options;
            }
          }

          await CustomizationField.create({
            mysqlId: field.id,
            productId: field.product_id,
            fieldName: field.field_name,
            fieldLabel: field.field_label,
            fieldType: field.field_type,
            placeholder: field.placeholder || "",
            options: parsedOptions,
            isRequired: Boolean(field.is_required),
            displayOrder: Number(field.display_order) || 0,
            createdAt: field.created_at,
          });

          console.log(
            `Migrated: ${field.field_name} → Product ID ${field.product_id}`
          );

          migratedCount++;
        } catch (fieldError) {
          console.error(
            `Failed to migrate field "${field.field_name}":`,
            fieldError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Customization Field Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(
        `Total MySQL Customization Fields: ${results.length}`
      );
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error(
      "Customization Field Migration Failed:",
      error
    );

    process.exit(1);
  }
};

migrateCustomizationFields();