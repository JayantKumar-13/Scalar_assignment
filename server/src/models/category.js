"use strict";

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      tableName: "categories",
      underscored: true,
      timestamps: false
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.Product, { foreignKey: "category_id", as: "products" });
  };

  return Category;
};

