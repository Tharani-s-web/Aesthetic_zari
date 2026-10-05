const mongoose = require("mongoose");
require("dotenv").config();

const HomepageSection = require("./models/HomepageSection");

async function checkSections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Database:", mongoose.connection.name);

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    console.log(
      "Collections:",
      collections.map((c) => c.name)
    );

    const sections = await HomepageSection.find().lean();

    console.log("HomepageSection count:", sections.length);
    console.log(JSON.stringify(sections, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error("ERROR:", error);
  }
}

checkSections();