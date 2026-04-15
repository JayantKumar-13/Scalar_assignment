import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../src/config/db.js";
import { loadEnv } from "../src/config/env.js";
import { categories, products } from "../src/data/sampleData.js";
import { hashPassword } from "../src/utils/crypto.js";

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const connection = await db.getConnection();

  try {
    const schemaPath = path.resolve(__dirname, "..", "..", "database", "schema.sql");
    const schemaSql = await fs.readFile(schemaPath, "utf8");

    await connection.query(schemaSql);

    const categoryIds = new Map();

    for (const category of categories) {
      const [result] = await connection.execute(
        "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
        [category.name, category.slug, category.description]
      );

      categoryIds.set(category.slug, result.insertId);
    }

    const demoEmail = (process.env.DEMO_USER_EMAIL || "demo@flipkartclone.dev").toLowerCase();
    const demoPassword = process.env.DEMO_USER_PASSWORD || "password123";

    await connection.execute(
      "INSERT INTO users (full_name, email, password_hash, phone) VALUES (?, ?, ?, ?)",
      ["Demo Shopper", demoEmail, hashPassword(demoPassword), "9876543210"]
    );

    for (const product of products) {
      const [result] = await connection.execute(
        `INSERT INTO products (
          category_id,
          name,
          slug,
          brand,
          short_description,
          description,
          highlights,
          specifications,
          price,
          original_price,
          discount_percentage,
          rating,
          review_count,
          stock,
          thumbnail_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          categoryIds.get(product.categorySlug),
          product.name,
          product.slug,
          product.brand,
          product.shortDescription,
          product.description,
          JSON.stringify(product.highlights),
          JSON.stringify(product.specifications),
          product.price,
          product.originalPrice,
          product.discountPercentage,
          product.rating,
          product.reviewCount,
          product.stock,
          product.thumbnailUrl
        ]
      );

      for (const [index, imageUrl] of product.images.entries()) {
        await connection.execute(
          "INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES (?, ?, ?, ?)",
          [result.insertId, imageUrl, `${product.name} view ${index + 1}`, index]
        );
      }
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await db.end();
  }
}

seed();
