const { DataTypes } = require('sequelize')
const sequelize = require('../../sequelize')

const ProductionRecord = sequelize.define(
  'ProductionRecord',
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    MACHINE_ID: { type: DataTypes.INTEGER, allowNull: false },
    MATERIAL_ID: { type: DataTypes.INTEGER, allowNull: false },

    PROD_DATE: { type: DataTypes.DATEONLY, allowNull: false }, // day
    SHIFT: {
      type: DataTypes.ENUM('A', 'B', 'C'),
      allowNull: false,
    },

    QUANTITY: { type: DataTypes.DECIMAL(18, 3), allowNull: false, defaultValue: 0 },
    NOTES: { type: DataTypes.TEXT, allowNull: true },

    DELETE_STATUS: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

    DATE_ADDED: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    UPDATE_DATE: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'WEB_PRODUCTION_RECORD',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['MACHINE_ID', 'MATERIAL_ID', 'PROD_DATE', 'SHIFT'],
        name: 'uniq_machine_material_day_shift',
      },
    ],
  }
)

module.exports = ProductionRecord
