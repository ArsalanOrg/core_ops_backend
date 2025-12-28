const { DataTypes } = require('sequelize')
const sequelize = require('../../sequelize')

const Material = sequelize.define(
  'Material',
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    NAME: { type: DataTypes.STRING, allowNull: false },
    UNIT: { type: DataTypes.STRING, allowNull: true }, // e.g. kg, pcs, m, lt
    DESCRIPTION: { type: DataTypes.TEXT, allowNull: true },

    DELETE_STATUS: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    DATE_ADDED: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    UPDATE_DATE: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'WEB_PRODUCTION_MATERIAL',
    timestamps: false,
  }
)

module.exports = Material
