import { query } from "../config/db.js";
import { mapProduct, safeParse } from "../utils/formatters.js";

const sortMap = {
  relevance: "p.created_at DESC",
  "price-asc": "p.price ASC",
  "price-desc": "p.price DESC",
  rating: "p.rating DESC, p.review_count DESC",
  newest: "p.created_at DESC"
};

export async function getProducts(req, res) {
  const { search = "", category = "", sort = "relevance" } = req.query;
  const conditions = [];
  const values = [];

  if (search.trim()) {
    conditions.push("(p.name LIKE ? OR p.brand LIKE ? OR p.short_description LIKE ?)");
    values.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
  }

  if (category.trim()) {
    conditions.push("c.slug = ?");
    values.push(category.trim());
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = sortMap[sort] || sortMap.relevance;

  const rows = await query(
    `SELECT
      p.id,
      p.category_id,
      p.name,
      p.slug,
      p.brand,
      p.short_description,
      p.description,
      p.price,
      p.original_price,
      p.discount_percentage,
      p.rating,
      p.review_count,
      p.stock,
      p.thumbnail_url,
      c.name AS category_name,
      c.slug AS category_slug
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     ${whereClause}
     ORDER BY ${orderBy}`,
    values
  );

  res.json({
    products: rows.map(mapProduct)
  });
}

export async function getProductBySlug(req, res) {
  const rows = await query(
    `SELECT
      p.*,
      c.name AS category_name,
      c.slug AS category_slug
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ?
     LIMIT 1`,
    [req.params.slug]
  );

  if (!rows.length) {
    return res.status(404).json({ message: "Product not found" });
  }

  const product = rows[0];
  const images = await query(
    "SELECT id, image_url, alt_text, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC",
    [product.id]
  );

  res.json({
    product: {
      ...mapProduct(product),
      highlights: safeParse(product.highlights, []),
      specifications: safeParse(product.specifications, {}),
      images: images.map((image) => ({
        id: image.id,
        url: image.image_url,
        alt: image.alt_text,
        sortOrder: image.sort_order
      }))
    }
  });
}
