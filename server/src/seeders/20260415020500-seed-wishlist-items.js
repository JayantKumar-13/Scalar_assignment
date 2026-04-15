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
      "runflex-street-sneaker",
      "vision-55-qled-tv"
    ]);
    const now = new Date();

    await queryInterface.bulkInsert("wishlist_items", [
      {
        user_id: userId,
        product_id: productIds["runflex-street-sneaker"],
        created_at: now
      },
      {
        user_id: userId,
        product_id: productIds["vision-55-qled-tv"],
        created_at: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("wishlist_items", null, {});
  }
};
