import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../src/models/Product.model.js";
import Category from "../src/models/Category.model.js";
import slugify from "slugify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const importCatalog = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB for catalog import...");

    // Read the catalog JSON
    const dataPath = path.join(__dirname, "dhriti_enterprise_catalog.json");
    const catalogData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    console.log(`Found ${catalogData.products.length} products in the catalog.`);

    // Wipe existing products and categories to ensure a clean state
    await Product.deleteMany();
    await Category.deleteMany();
    console.log("Cleared existing Products and Categories.");

    const categoriesMap = new Map();

    let index = 0;
    for (const item of catalogData.products) {
      index++;
      // Create or get category
      const categoryName = item.category || "Uncategorized";
      if (!categoriesMap.has(categoryName)) {
        const cat = await Category.create({
          name: categoryName,
          slug: slugify(categoryName, { lower: true, strict: true }),
        });
        categoriesMap.set(categoryName, cat._id);
      }

      const categoryId = categoriesMap.get(categoryName);

      // Parse price and unit
      let numericPrice = 0;
      let unit = "Piece";
      if (item.price) {
        // e.g. "₹ 1,640/Piece"
        const parts = item.price.split("/");
        const priceStr = parts[0].replace(/[^0-9.]/g, ""); // removes symbols, commas
        numericPrice = parseFloat(priceStr) || 0;
        
        if (parts.length > 1) {
          unit = parts[1].trim();
        }
      }

      // Material defaults from specifications if available, otherwise "Standard"
      const material = item.specifications?.Material || "Standard";

      // Build specifications map
      const specs: Record<string, string> = {};
      if (item.specifications) {
        for (const [k, v] of Object.entries(item.specifications)) {
          specs[k] = String(v);
        }
      }

      await Product.create({
        name: item.product_name,
        slug: slugify(item.product_name, { lower: true, strict: true }) + "-" + index,
        material,
        price: numericPrice,
        unit,
        category: categoryId,
        description: item.description || "No description available.",
        inStock: true,
        stockQuantity: 100, // default stock
        images: item.images || [],
        mainImage: item.images && item.images.length > 0 ? item.images[0] : undefined,
        productUrl: item.product_url,
        minOrderQuantity: item.minimum_order_quantity ? String(item.minimum_order_quantity) : undefined,
        specifications: specs,
        isFeatured: false,
      });
    }

    console.log("Successfully imported catalog data!");
    process.exit(0);
  } catch (error) {
    console.error("Error importing catalog:", error);
    process.exit(1);
  }
};

importCatalog();
