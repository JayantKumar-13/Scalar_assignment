"use strict";

const { categories } = require("./data/catalog.cjs");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "categories",
      categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        created_at: now
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("categories", {
      slug: categories.map((category) => category.slug)
    });
  }
};

