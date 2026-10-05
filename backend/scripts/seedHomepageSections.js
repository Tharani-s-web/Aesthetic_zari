const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const connectMongoDB = require("../config/mongodb");
const HomepageSection = require("../models/HomepageSection");

const sections = [
  {
    sectionType: "hero",

    title: "Handcrafted Stories, Stitched With Love",

    subtitle: "Aesthetic Zari",

    description:
      "Thoughtfully handcrafted embroidery creations made to celebrate your most special moments.",

    images: [],

    selectedProducts: [],

    settings: {
      buttonText: "Explore Collection",
      buttonLink: "/products",
    },

    position: 1,

    isActive: true,
  },

  {
    sectionType: "featured_categories",

    title: "Explore Our Collections",

    subtitle: "Find something made for your moment",

    description:
      "Discover handcrafted creations thoughtfully designed for weddings, birthdays, family and meaningful celebrations.",

    images: [],

    selectedProducts: [],

    settings: {
      categoryLimit: 6,
    },

    position: 2,

    isActive: true,
  },

  {
    sectionType: "brand_story",

    title: "Every Stitch Tells A Story",

    subtitle: "Made by hand. Made with heart.",

    description:
      "At Aesthetic Zari, every creation is carefully embroidered by hand and designed to preserve memories in a beautiful and meaningful way.",

    images: [],

    selectedProducts: [],

    settings: {
      buttonText: "Our Story",
      buttonLink: "/about",
      imagePosition: "right",
    },

    position: 3,

    isActive: true,
  },

  {
    sectionType: "featured_products",

    title: "Featured Creations",

    subtitle: "Handpicked for you",

    description:
      "Explore some of our handcrafted creations made for gifting and celebrating life's special moments.",

    images: [],

    selectedProducts: [],

    settings: {
      productLimit: 4,
      layout: "grid",
    },

    position: 4,

    isActive: true,
  },

  {
    sectionType: "customization_process",

    title: "Made Personal, Just For You",

    subtitle: "From your idea to a handmade creation",

    description:
      "Choose your creation, share your personal details and let us turn your memories into something handmade and memorable.",

    images: [],

    selectedProducts: [],

    settings: {
      steps: [
        {
          number: 1,
          title: "Choose Your Creation",
          description:
            "Pick the embroidery design that speaks to you.",
        },
        {
          number: 2,
          title: "Share Your Details",
          description:
            "Tell us the names, dates or details you want personalized.",
        },
        {
          number: 3,
          title: "We Stitch Your Story",
          description:
            "Your personalized creation is carefully handcrafted for you.",
        },
      ],
    },

    position: 5,

    isActive: true,
  },

  {
    sectionType: "why_choose_us",

    title: "Why Choose Aesthetic Zari?",

    subtitle: "More than a gift, it's a memory",

    description:
      "We create thoughtful handmade pieces that turn meaningful moments into something you can keep forever.",

    images: [],

    selectedProducts: [],

    settings: {
      features: [
        {
          title: "Handcrafted With Care",
          description:
            "Every piece is carefully embroidered by hand.",
        },
        {
          title: "Personalized For You",
          description:
            "Your memories and ideas become part of the creation.",
        },
        {
          title: "Made For Meaningful Moments",
          description:
            "Perfect for weddings, birthdays, anniversaries and special celebrations.",
        },
        {
          title: "Thoughtful Gifting",
          description:
            "A unique handmade gift created to be remembered.",
        },
      ],
    },

    position: 6,

    isActive: true,
  },
];

async function seedHomepageSections() {
  try {
    console.log("Connecting to MongoDB...");

    await connectMongoDB();

    console.log("MongoDB connected.");

    // Remove existing homepage sections
    await HomepageSection.deleteMany({});

    console.log("Existing homepage sections cleared.");

    // Insert new sections
    const createdSections =
      await HomepageSection.insertMany(sections);

    console.log(
      `Successfully created ${createdSections.length} homepage sections.`
    );

    createdSections.forEach((section) => {
      console.log(
        `${section.position}. ${section.sectionType}`
      );
    });

    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
    console.log("Homepage sections seeded successfully.");
  } catch (error) {
    console.error(
      "Failed to seed homepage sections:",
      error
    );

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

seedHomepageSections();