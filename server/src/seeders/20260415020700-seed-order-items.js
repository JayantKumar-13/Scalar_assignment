"use strict";

const { QueryTypes } = require("sequelize");

async function getOrderId(queryInterface, orderNumber) {
  const rows = await queryInterface.sequelize.query(
    "SELECT id FROM orders WHERE order_number = ? LIMIT 1",
    {
      replacements: [orderNumber],
      type: QueryTypes.SELECT
    }
  );

  return rows[0]?.id;
}

async function getProductId(queryInterface, slug) {
  const rows = await queryInterface.sequelize.query(
    "SELECT id FROM products WHERE slug = ? LIMIT 1",
    {
      replacements: [slug],
      type: QueryTypes.SELECT
    }
  );

  return rows[0]?.id;
}

module.exports = {
  async up(queryInterface) {
    const orderId = await getOrderId(queryInterface, "FK2026041510001234");
    const productId = await getProductId(queryInterface, "aerobook-slim-14");
    const now = new Date("2026-04-15T10:00:00.000Z");

    await queryInterface.bulkInsert("order_items", [
      {
        order_id: orderId,
        product_id: productId,
        product_name: "AeroBook Slim 14",
        product_brand: "Aero",
        product_image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
        unit_price: 68990,
        quantity: 1,
        line_total: 68990,
        created_at: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("order_items", null, {});
  }
};
