"use strict";

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      category_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(190),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(220),
        allowNull: false,
        unique: true
      },
      brand: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      short_description: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      highlights: {
        type: DataTypes.JSON,
        allowNull: false
      },
      specifications: {
        type: DataTypes.JSON,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      original_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      discount_percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0
      },
      review_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      thumbnail_url: {
        type: DataTypes.STRING(500),
        allowNull: false
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
      tableName: "products",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, { foreignKey: "category_id", as: "category" });
    Product.hasMany(models.ProductImage, { foreignKey: "product_id", as: "images" });
    Product.hasMany(models.CartItem, { foreignKey: "product_id", as: "cartItems" });
    Product.hasMany(models.WishlistItem, { foreignKey: "product_id", as: "wishlistItems" });
    Product.hasMany(models.OrderItem, { foreignKey: "product_id", as: "orderItems" });
  };

  return Product;
};

