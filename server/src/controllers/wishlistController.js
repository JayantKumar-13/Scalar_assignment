import { query } from "../config/db.js";

async function buildWishlist(userId) {
  const rows = await query(
    `SELECT
      p.id,
      p.name,
      p.slug,
      p.brand,
      p.price,
      p.original_price,
      p.rating,
      p.review_count,
      p.stock,
      p.thumbnail_url
     FROM wishlist_items wi
     INNER JOIN products p ON p.id = wi.product_id
     WHERE wi.user_id = ?
     ORDER BY wi.created_at DESC`,
    [userId]
  );

  return {
    items: rows.map((row) => ({
      productId: row.id,
      name: row.name,
      slug: row.slug,
      brand: row.brand,
      price: Number(row.price),
      originalPrice: Number(row.original_price),
      rating: Number(row.rating),
      reviewCount: row.review_count,
      stock: row.stock,
      thumbnailUrl: row.thumbnail_url
    }))
  };
}

export async function getWishlist(req, res) {
  res.json(await buildWishlist(req.user.id));
}

export async function addToWishlist(req, res) {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  await query(
    "INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)",
    [req.user.id, productId]
  );

  res.status(201).json(await buildWishlist(req.user.id));
}

export async function removeFromWishlist(req, res) {
  await query("DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?", [
    req.user.id,
    Number(req.params.productId)
  ]);

  res.json(await buildWishlist(req.user.id));
}

