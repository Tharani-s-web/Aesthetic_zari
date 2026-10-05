const bcrypt = require("bcrypt");

async function generatePassword() {
  try {
    const password = "Admin@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("\nOriginal Password:", password);
    console.log("Hashed Password:", hashedPassword);
  } catch (error) {
    console.error("Error:", error);
  }
}

generatePassword();