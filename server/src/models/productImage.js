"use strict";

module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    "ProductImage",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      image_url: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      alt_text: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: "product_images",
      underscored: true,
      timestamps: false
    }
  );

  ProductImage.associate = (models) => {
    ProductImage.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
  };

  return ProductImage;
};
