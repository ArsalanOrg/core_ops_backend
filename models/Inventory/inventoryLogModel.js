// models/Inventory/inventoryLog.js

const { DataTypes } = require('sequelize')
const sequelize = require('../../sequelize')

const InventoryLog = sequelize.define(
  'WEB_INVENTORY_LOG',
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    INVENTORY_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // you can add a foreign key constraint if you like:
      // references: { model: 'WEB_INVENTORY', key: 'ID' }
    },
    INVENTORY_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
      // you can add a foreign key constraint if you like:
      // references: { model: 'WEB_INVENTORY', key: 'ID' }
    },
    USER_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
      // references: { model: 'Users', key: 'ID' }
    },
    USER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: { model: 'Users', key: 'ID' }
    },
    ACTION: {
      type: DataTypes.ENUM('EKLEME', 'GUNCELLEME', 'SILME', 'DEPO_CIKISI'),
      allowNull: false,
    },
    QUANTITY_CHANGED: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    PREVIOUS_QUANTITY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    NEW_QUANTITY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    DETAILS: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    CREATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'WEB_INVENTORY_LOG',
    timestamps: false, // we manage CREATED_AT ourselves
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  }
)

module.exports = InventoryLog
