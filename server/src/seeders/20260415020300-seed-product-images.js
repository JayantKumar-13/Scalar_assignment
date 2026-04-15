"use strict";

const { QueryTypes } = require("sequelize");
const { products } = require("./data/catalog.cjs");

async function getProductMap(queryInterface) {
  const rows = await queryInterface.sequelize.query(
    "SELECT id, slug FROM products",
    { type: QueryTypes.SELECT }
  );

  return rows.reduce((accumulator, row) => {
    accumulator[row.slug] = row.id;
    return accumulator;
  }, {});
}

module.exports = {
  async up(queryInterface) {
    const productMap = await getProductMap(queryInterface);

    const imageRows = products.flatMap((product) =>
      product.images.map((imageUrl, index) => ({
        product_id: productMap[product.slug],
        image_url: imageUrl,
        alt_text: `${product.name} view ${index + 1}`,
        sort_order: index
      }))
    );

    await queryInterface.bulkInsert("product_images", imageRows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("product_images", null, {});
  }
};
