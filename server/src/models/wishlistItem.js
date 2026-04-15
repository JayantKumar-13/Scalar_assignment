"use strict";

module.exports = (sequelize, DataTypes) => {
  const WishlistItem = sequelize.define(
    "WishlistItem",
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
      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      tableName: "wishlist_items",
      underscored: true,
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "product_id"]
        }
      ]
    }
  );

  WishlistItem.associate = (models) => {
    WishlistItem.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    WishlistItem.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
  };

  return WishlistItem;
};

