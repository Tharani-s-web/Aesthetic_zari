require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const Address = require("../models/Address");

const migrateAddresses = async () => {
  try {
    await connectMongoDB();

    console.log("Starting address migration...");

    const query = `
      SELECT
        id,
        user_id,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        landmark,
        is_default,
        created_at,
        updated_at
      FROM addresses
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Address Fetch Error:", error);
        process.exit(1);
      }

      console.log(`Found ${results.length} addresses in MySQL.`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const address of results) {
        try {
          const existingAddress = await Address.findOne({
            mysqlId: address.id,
          });

          if (existingAddress) {
            console.log(
              `Skipping address ID ${address.id} - already migrated.`
            );

            skippedCount++;
            continue;
          }

          await Address.create({
            mysqlId: address.id,
            userId: address.user_id,
            fullName: address.full_name,
            phone: address.phone,
            addressLine1: address.address_line1,
            addressLine2: address.address_line2 || "",
            city: address.city,
            state: address.state,
            pincode: String(address.pincode),
            landmark: address.landmark || "",
            isDefault: Boolean(address.is_default),
            createdAt: address.created_at,
            updatedAt: address.updated_at,
          });

          console.log(
            `Migrated: Address ID ${address.id} → User ID ${address.user_id}`
          );

          migratedCount++;
        } catch (addressError) {
          console.error(
            `Failed to migrate address ID ${address.id}:`,
            addressError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Address Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(`Total MySQL Addresses: ${results.length}`);
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error("Address Migration Failed:", error);
    process.exit(1);
  }
};

migrateAddresses();