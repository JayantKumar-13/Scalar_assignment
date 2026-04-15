import { query } from "../config/db.js";

export async function getCategories(req, res) {
  const rows = await query(
    `SELECT c.id, c.name, c.slug, c.description, COUNT(p.id) AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name`
  );

  res.json({
    categories: rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      productCount: Number(row.product_count)
    }))
  });
}

