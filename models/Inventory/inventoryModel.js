const { DataTypes } = require('sequelize')
const sequelize = require('../../sequelize')

const Inventory = sequelize.define(
  'WEB_INVENTORY',
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ITEM_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    CATEGORY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    QUANTITY_IN_STOCK: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    REORDER_LEVEL: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    SUPPLIER_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    UNIT_PRICE: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    RETAIL_PRICE: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    LOCATION: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    SHELF: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    DATE_ADDED: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    DELETE_STATUS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    BARCODE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    IMAGE_URL: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    PRODUCT_IMAGE: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    PRODUCT_STATUS: {
      type: DataTypes.INTEGER, // 1: Yeni, 0: Kullanılmış
      allowNull: true,
    },
    SKOD1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    SKOD2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    NKOD1: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    NKOD2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'WEB_INVENTORY',
    timestamps: false,
  }
)

module.exports = Inventory
