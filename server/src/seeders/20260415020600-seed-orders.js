"use strict";

const { QueryTypes } = require("sequelize");

async function getUserId(queryInterface, email) {
  const rows = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    {
      replacements: [email],
      type: QueryTypes.SELECT
    }
  );

  return rows[0]?.id;
}

module.exports = {
  async up(queryInterface) {
    const userId = await getUserId(queryInterface, "demo@flipkartclone.dev");
    const now = new Date("2026-04-15T10:00:00.000Z");

    await queryInterface.bulkInsert("orders", [
      {
        user_id: userId,
        order_number: "FK2026041510001234",
        status: "Delivered",
        payment_method: "Cash on Delivery",
        subtotal: 68990,
        discount_total: 11000,
        shipping_fee: 0,
        total: 68990,
        email_status: "skipped",
        shipping_full_name: "Demo Shopper",
        shipping_phone: "9876543210",
        shipping_address_line1: "221, Demo Residency",
        shipping_address_line2: "Near Tech Park",
        shipping_city: "Bengaluru",
        shipping_state: "Karnataka",
        shipping_postal_code: "560001",
        shipping_country: "India",
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("orders", {
      order_number: ["FK2026041510001234"]
    });
  }
};
