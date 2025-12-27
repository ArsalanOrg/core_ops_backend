const { DataTypes } = require('sequelize')
const sequelize = require('../../sequelize')

const Category = sequelize.define(
  'WEB_INVENTORY_CATEGORY',
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    DELETE_STATUS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'WEB_INVENTORY_CATEGORY',
    timestamps: false,
  }
)

module.exports = Category
