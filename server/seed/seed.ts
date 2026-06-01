import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Import models
import User from "../src/models/User.model.js";
import Category from "../src/models/Category.model.js";
import Product from "../src/models/Product.model.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/dhriti-enterprise";

const categories = [
  { name: "Door Handle", slug: "door-handle" },
  { name: "Door Aldrop", slug: "door-aldrop" },
  { name: "Soap Dish", slug: "soap-dish" },
  { name: "Curtain Bracket", slug: "curtain-bracket" },
  { name: "Tumbler Holder", slug: "tumbler-holder" },
  { name: "Wall Shelf", slug: "wall-shelf" },
  { name: "Curtain Support", slug: "curtain-support" },
  { name: "Door Stopper", slug: "door-stopper" },
];

const rawProducts = [
  { name: "Stainless Steel Mortise Handles", categoryName: "Door Handle", price: 640, unit: "per Piece" },
  { name: "D Shaped Glass Door Handle", categoryName: "Door Handle", price: 525, unit: "per Piece" },
  { name: "Stainless Steel Door Pull Handles (8 inch)", categoryName: "Door Handle", price: 500, unit: "per Piece" },
  { name: "H Shape Glass Door Handles", categoryName: "Door Handle", price: 482, unit: "per Piece" },
  { name: "Stainless Steel Door Pull Handles", categoryName: "Door Handle", price: 166, unit: "per Piece" },
  { name: "Aluminium Profile Handle", categoryName: "Door Handle", price: 64, unit: "per Piece" },

  { name: "16mm Leg Aldrop", categoryName: "Door Aldrop", price: 446, unit: "per Piece" },
  { name: "16 Mm Stainless Steel Aldrop", categoryName: "Door Aldrop", price: 280, unit: "per Piece" },
  { name: "8 Inch Stainless Steel Aldrop", categoryName: "Door Aldrop", price: 210, unit: "per Piece" },
  { name: "14mm Stainless Steel Aldrops", categoryName: "Door Aldrop", price: 145, unit: "per Piece" },
  { name: "Stainless Steel Door Aldrop", categoryName: "Door Aldrop", price: 90, unit: "per Piece" },

  { name: "Stainless Steel Soap Dish Tumbler", categoryName: "Soap Dish", price: 490, unit: "per Piece" },
  { name: "Matte Finish Soap Dish", categoryName: "Soap Dish", price: 450, unit: "per Piece" },
  { name: "Stainless Steel Soap Dish", categoryName: "Soap Dish", price: 224, unit: "per Piece" },
  { name: "ABS Double Soap Dish", categoryName: "Soap Dish", price: 64, unit: "per Piece" },
  { name: "Plastic White ABS Soap Dish", categoryName: "Soap Dish", price: 38, unit: "per Piece" },

  { name: "Brown Curtain Bracket", categoryName: "Curtain Bracket", price: 120, unit: "per Pair" },
  { name: "Stainless Steel Round Shape Curtain Bracket", categoryName: "Curtain Bracket", price: 98, unit: "per Pair" },
  { name: "Stainless Steel Curtain Finials", categoryName: "Curtain Bracket", price: 60, unit: "per Pair" },
  { name: "Stainless Steel Curtain Bracket", categoryName: "Curtain Bracket", price: 58, unit: "per Pair" },

  { name: "Plastic White 4 In 1 ABS Tumbler Holder", categoryName: "Tumbler Holder", price: 115, unit: "per Piece" },
  { name: "ABS Toothbrush Tumbler Holder", categoryName: "Tumbler Holder", price: 65, unit: "per Piece" },

  { name: "Stainless Steel Bathroom Wall Shelf", categoryName: "Wall Shelf", price: 695, unit: "per Piece" },
  { name: "3 PCS ABS Corner Shelf", categoryName: "Wall Shelf", price: 380, unit: "per Piece" },
  { name: "ABS Wall Shelf", categoryName: "Wall Shelf", price: 148, unit: "per Piece" },
  { name: "ABS Shelf Corner Bathroom Holder", categoryName: "Wall Shelf", price: 132, unit: "per Piece" },

  { name: "Stainless Steel L Supports", categoryName: "Curtain Support", price: 64, unit: "per Piece" },
  { name: "Stainless Steel T Support", categoryName: "Curtain Support", price: 50, unit: "per Piece" },

  { name: "Stainless Steel Door Stopper", categoryName: "Door Stopper", price: 50, unit: "per Piece" },
  { name: "SS Tower Bolt", categoryName: "Door Stopper", price: 34, unit: "per Piece" }
];

async function seedDatabase() {
  try {
    const slugify = (await import("slugify")).default;

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected for seeding.");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("✅ Existing data cleared.");

    // Insert categories
    console.log("📁 Inserting categories...");
    const insertedCategories = await Category.insertMany(categories);
    console.log(`  → ${insertedCategories.length} categories inserted.`);

    // Create category map
    const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
    for (const cat of insertedCategories) {
      categoryMap[cat.name] = cat._id;
    }

    // Prepare products
    console.log("📦 Preparing products...");
    const productsWithCategoryIds = rawProducts.map((product) => {
      // Determine a pseudo-material from the name for UI
      let material = "Hardware";
      if (product.name.toLowerCase().includes("stainless steel") || product.name.toLowerCase().includes("ss")) {
        material = "Stainless Steel";
      } else if (product.name.toLowerCase().includes("glass")) {
        material = "Glass";
      } else if (product.name.toLowerCase().includes("abs") || product.name.toLowerCase().includes("plastic")) {
        material = "ABS Plastic";
      } else if (product.name.toLowerCase().includes("aluminium")) {
        material = "Aluminium";
      }

      return {
        name: product.name,
        slug: slugify(product.name, { lower: true, strict: true }),
        material: material,
        price: product.price,
        originalPrice: Math.round(product.price * 1.15), // add 15% to create a pseudo-discount
        unit: product.unit,
        category: categoryMap[product.categoryName],
        description: `Premium quality ${product.name} from Dhriti Enterprise. Perfect for your home and commercial needs. Extremely durable and reliable.`,
        inStock: true,
        stockQuantity: Math.floor(Math.random() * 100) + 10, // random stock between 10 and 110
        isFeatured: Math.random() > 0.8, // 20% chance to be featured
        images: [],
        tags: [product.categoryName.toLowerCase(), material.toLowerCase()],
      };
    });

    const insertedProducts = await Product.insertMany(productsWithCategoryIds);
    console.log(`  → ${insertedProducts.length} products inserted.`);

    // Create admin user
    console.log("👤 Creating admin user...");
    const adminUser = await User.create({
      name: "Admin (K Goswami)",
      email: "admin@dhriti.com",
      password: "admin123",
      role: "admin",
    });
    console.log(`  → Admin user created: ${adminUser.email}`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Admin credentials:");
    console.log("   Email: admin@dhriti.com");
    console.log("   Password: admin123");
    console.log(`\n📊 Summary: ${insertedCategories.length} categories, ${insertedProducts.length} products, 1 admin user`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
