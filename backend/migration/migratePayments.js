require("dotenv").config();

const connection = require("../config/db");
const connectMongoDB = require("../config/mongodb");
const Payment = require("../models/Payment");

const migratePayments = async () => {
  try {
    await connectMongoDB();

    console.log("Starting payment migration...");

    const query = `
      SELECT
        id,
        order_id,
        payment_method,
        payment_gateway,
        transaction_id,
        amount,
        payment_status,
        paid_at,
        created_at
      FROM payments
    `;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error("MySQL Payment Fetch Error:", error);
        process.exit(1);
      }

      console.log(`Found ${results.length} payments in MySQL.`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const payment of results) {
        try {
          const existingPayment = await Payment.findOne({
            mysqlId: payment.id,
          });

          if (existingPayment) {
            console.log(
              `Skipping payment ID ${payment.id} - already migrated.`
            );

            skippedCount++;
            continue;
          }

          await Payment.create({
            mysqlId: payment.id,
            orderId: payment.order_id,
            paymentMethod: payment.payment_method,
            paymentGateway: payment.payment_gateway || "",
            transactionId: payment.transaction_id || "",
            amount: Number(payment.amount),
            paymentStatus: payment.payment_status,
            paidAt: payment.paid_at || null,
            createdAt: payment.created_at,
          });

          console.log(
            `Migrated: Payment ID ${payment.id} → Order ID ${payment.order_id}`
          );

          migratedCount++;
        } catch (paymentError) {
          console.error(
            `Failed to migrate payment ID ${payment.id}:`,
            paymentError.message
          );
        }
      }

      console.log("\n================================");
      console.log("Payment Migration Completed");
      console.log("================================");
      console.log(`Migrated: ${migratedCount}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log(`Total MySQL Payments: ${results.length}`);
      console.log("================================");

      process.exit(0);
    });
  } catch (error) {
    console.error("Payment Migration Failed:", error);

    process.exit(1);
  }
};

migratePayments();