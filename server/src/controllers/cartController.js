import { query } from "../config/db.js";

async function buildCart(userId) {
  const rows = await query(
    `SELECT
      ci.product_id,
      ci.quantity,
      p.name,
      p.slug,
      p.brand,
      p.price,
      p.original_price,
      p.stock,
      p.thumbnail_url
     FROM cart_items ci
     INNER JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?
     ORDER BY ci.updated_at DESC`,
    [userId]
  );

  const items = rows.map((row) => ({
    productId: row.product_id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    stock: row.stock,
    thumbnailUrl: row.thumbnail_url,
    quantity: row.quantity,
    lineTotal: Number(row.price) * row.quantity
  }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = items.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );

  return {
    items,
    summary: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discount,
      shippingFee: 0,
      total: subtotal
    }
  };
}

export async function getCart(req, res) {
  res.json(await buildCart(req.user.id));
}

export async function addToCart(req, res) {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  const products = await query("SELECT id, stock FROM products WHERE id = ? LIMIT 1", [productId]);

  if (!products.length) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (products[0].stock < quantity) {
    return res.status(400).json({ message: "Requested quantity is not available" });
  }

  await query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + VALUES(quantity), ?)`,
    [req.user.id, productId, quantity, products[0].stock]
  );

  res.status(201).json(await buildCart(req.user.id));
}

export async function updateCartItem(req, res) {
  const productId = Number(req.params.productId);
  const quantity = Number(req.body.quantity);

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  const products = await query("SELECT id, stock FROM products WHERE id = ? LIMIT 1", [productId]);

  if (!products.length) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (products[0].stock < quantity) {
    return res.status(400).json({ message: "Requested quantity exceeds stock" });
  }

  const result = await query(
    "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
    [quantity, req.user.id, productId]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  res.json(await buildCart(req.user.id));
}

export async function removeCartItem(req, res) {
  await query("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [
    req.user.id,
    Number(req.params.productId)
  ]);

  res.json(await buildCart(req.user.id));
}

