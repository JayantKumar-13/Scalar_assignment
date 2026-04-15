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

async function getProductIds(queryInterface, slugs) {
  const rows = await queryInterface.sequelize.query(
    `SELECT id, slug FROM products WHERE slug IN (${slugs.map(() => "?").join(", ")})`,
    {
      replacements: slugs,
      type: QueryTypes.SELECT
    }
  );

  return rows.reduce((accumulator, row) => {
    accumulator[row.slug] = row.id;
    return accumulator;
  }, {});
}

module.exports = {
  async up(queryInterface) {
    const userId = await getUserId(queryInterface, "demo@flipkartclone.dev");
    const productIds = await getProductIds(queryInterface, [
      "nova-x-pro-5g",
      "pulsepods-max-anc"
    ]);
    const now = new Date();

    await queryInterface.bulkInsert("cart_items", [
      {
        user_id: userId,
        product_id: productIds["nova-x-pro-5g"],
        quantity: 1,
        created_at: now,
        updated_at: now
      },
      {
        user_id: userId,
        product_id: productIds["pulsepods-max-anc"],
        quantity: 2,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("cart_items", null, {});
  }
};
