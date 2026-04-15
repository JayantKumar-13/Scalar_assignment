"use strict";

const { QueryTypes } = require("sequelize");
const { products } = require("./data/catalog.cjs");

async function getCategoryMap(queryInterface) {
  const rows = await queryInterface.sequelize.query(
    "SELECT id, slug FROM categories",
    { type: QueryTypes.SELECT }
  );

  return rows.reduce((accumulator, row) => {
    accumulator[row.slug] = row.id;
    return accumulator;
  }, {});
}

module.exports = {
  async up(queryInterface) {
    const categoryMap = await getCategoryMap(queryInterface);
    const now = new Date();

    await queryInterface.bulkInsert(
      "products",
      products.map((product) => ({
        category_id: categoryMap[product.categorySlug],
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        short_description: product.shortDescription,
        description: product.description,
        highlights: JSON.stringify(product.highlights),
        specifications: JSON.stringify(product.specifications),
        price: product.price,
        original_price: product.originalPrice,
        discount_percentage: product.discountPercentage,
        rating: product.rating,
        review_count: product.reviewCount,
        stock: product.stock,
        thumbnail_url: product.thumbnailUrl,
        created_at: now,
        updated_at: now
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("products", {
      slug: products.map((product) => product.slug)
    });
  }
};
