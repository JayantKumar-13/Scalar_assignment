"use strict";

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      order_number: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true
      },
      status: {
        type: DataTypes.ENUM("Placed", "Packed", "Shipped", "Delivered"),
        allowNull: false,
        defaultValue: "Placed"
      },
      payment_method: {
        type: DataTypes.STRING(60),
        allowNull: false,
        defaultValue: "Cash on Delivery"
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      discount_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      shipping_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      email_status: {
        type: DataTypes.ENUM("pending", "sent", "skipped", "failed"),
        allowNull: false,
        defaultValue: "pending"
      },
      shipping_full_name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      shipping_phone: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      shipping_address_line1: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      shipping_address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      shipping_city: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      shipping_state: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      shipping_postal_code: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      shipping_country: {
        type: DataTypes.STRING(120),
        allowNull: false,
        defaultValue: "India"
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      tableName: "orders",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    Order.hasMany(models.OrderItem, { foreignKey: "order_id", as: "items" });
  };

  return Order;
};

