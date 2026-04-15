"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      order_number: {
        type: Sequelize.STRING(32),
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM("Placed", "Packed", "Shipped", "Delivered"),
        allowNull: false,
        defaultValue: "Placed"
      },
      payment_method: {
        type: Sequelize.STRING(60),
        allowNull: false,
        defaultValue: "Cash on Delivery"
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      shipping_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      email_status: {
        type: Sequelize.ENUM("pending", "sent", "skipped", "failed"),
        allowNull: false,
        defaultValue: "pending"
      },
      shipping_full_name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      shipping_phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      shipping_address_line1: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      shipping_address_line2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      shipping_city: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      shipping_state: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      shipping_postal_code: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      shipping_country: {
        type: Sequelize.STRING(120),
        allowNull: false,
        defaultValue: "India"
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("orders");
  }
};

