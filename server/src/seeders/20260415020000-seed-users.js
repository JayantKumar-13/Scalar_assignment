"use strict";

const { randomBytes, scryptSync } = require("node:crypto");

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("users", [
      {
        full_name: "Demo Shopper",
        email: "demo@flipkartclone.dev",
        password_hash: hashPassword("password123"),
        phone: "9876543210",
        role: "customer",
        created_at: now,
        updated_at: now
      },
      {
        full_name: "Admin Reviewer",
        email: "admin@flipkartclone.dev",
        password_hash: hashPassword("admin123"),
        phone: "9999999999",
        role: "admin",
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: ["demo@flipkartclone.dev", "admin@flipkartclone.dev"]
    });
  }
};

