import { db, query } from "../config/db.js";
import { sendOrderEmail } from "../utils/mail.js";
import { createOrderNumber } from "../utils/orderNumber.js";

function mapOrderRow(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    discountTotal: Number(row.discount_total),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    emailStatus: row.email_status,
    createdAt: row.created_at,
    shippingAddress: {
      fullName: row.shipping_full_name,
      phone: row.shipping_phone,
      addressLine1: row.shipping_address_line1,
      addressLine2: row.shipping_address_line2,
      city: row.shipping_city,
      state: row.shipping_state,
      postalCode: row.shipping_postal_code,
      country: row.shipping_country
    }
  };
}

async function fetchOrders(userId, orderNumber) {
  const values = [userId];
  const orderFilter = orderNumber ? "AND o.order_number = ?" : "";

  if (orderNumber) {
    values.push(orderNumber);
  }

  const orders = await query(
    `SELECT *
     FROM orders o
     WHERE o.user_id = ? ${orderFilter}
     ORDER BY o.created_at DESC`,
    values
  );

  if (!orders.length) {
    return [];
  }

  const items = await query(
    `SELECT *
     FROM order_items
     WHERE order_id IN (${orders.map(() => "?").join(", ")})
     ORDER BY id ASC`,
    orders.map((order) => order.id)
  );

  return orders.map((order) => ({
    ...mapOrderRow(order),
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        productBrand: item.product_brand,
        productImage: item.product_image,
        unitPrice: Number(item.unit_price),
        quantity: item.quantity,
        lineTotal: Number(item.line_total)
      }))
  }));
}

export async function getOrders(req, res) {
  const orders = await fetchOrders(req.user.id);
  res.json({ orders });
}

export async function getOrderByNumber(req, res) {
  const orders = await fetchOrders(req.user.id, req.params.orderNumber);

  if (!orders.length) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json({ order: orders[0] });
}

export async function createOrder(req, res) {
  const { shippingAddress, paymentMethod = "Cash on Delivery" } = req.body;

  if (
    !shippingAddress?.fullName ||
    !shippingAddress?.phone ||
    !shippingAddress?.addressLine1 ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.postalCode
  ) {
    return res.status(400).json({ message: "Please provide a complete shipping address" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [cartItems] = await connection.execute(
      `SELECT
        ci.product_id,
        ci.quantity,
        p.name,
        p.brand,
        p.price,
        p.original_price,
        p.stock,
        p.thumbnail_url
       FROM cart_items ci
       INNER JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       FOR UPDATE`,
      [req.user.id]
    );

    if (!cartItems.length) {
      await connection.rollback();
      return res.status(400).json({ message: "Your cart is empty" });
    }

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          message: `Only ${item.stock} units left for ${item.name}`
        });
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const discountTotal = cartItems.reduce(
      (sum, item) => sum + (Number(item.original_price) - Number(item.price)) * item.quantity,
      0
    );
    const shippingFee = 0;
    const total = subtotal + shippingFee;
    const orderNumber = createOrderNumber();

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        user_id,
        order_number,
        payment_method,
        subtotal,
        discount_total,
        shipping_fee,
        total,
        shipping_full_name,
        shipping_phone,
        shipping_address_line1,
        shipping_address_line2,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        orderNumber,
        paymentMethod,
        subtotal,
        discountTotal,
        shippingFee,
        total,
        shippingAddress.fullName,
        shippingAddress.phone,
        shippingAddress.addressLine1,
        shippingAddress.addressLine2 || null,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.postalCode,
        shippingAddress.country || "India"
      ]
    );

    for (const item of cartItems) {
      await connection.execute(
        `INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          product_brand,
          product_image,
          unit_price,
          quantity,
          line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          item.product_id,
          item.name,
          item.brand,
          item.thumbnail_url,
          item.price,
          item.quantity,
          Number(item.price) * item.quantity
        ]
      );

      await connection.execute("UPDATE products SET stock = stock - ? WHERE id = ?", [
        item.quantity,
        item.product_id
      ]);
    }

    await connection.execute("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
    await connection.commit();

    let emailResult = { status: "skipped" };

    try {
      emailResult = await sendOrderEmail({
        to: req.user.email,
        customerName: shippingAddress.fullName,
        orderNumber,
        total,
        items: cartItems
      });
    } catch (mailError) {
      console.error("Order email failed:", mailError.message);
      emailResult = { status: "failed" };
    }

    await query("UPDATE orders SET email_status = ? WHERE id = ?", [
      emailResult.status,
      orderResult.insertId
    ]);

    const [createdOrder] = await fetchOrders(req.user.id, orderNumber);
    res.status(201).json({
      message: "Order placed successfully",
      order: createdOrder
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
