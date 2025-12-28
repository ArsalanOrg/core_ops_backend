const { DataTypes } = require('sequelize')
const sequelize = require('../../sequelize')

const ProductionLog = sequelize.define(
  'ProductionLog',
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    RECORD_ID: { type: DataTypes.INTEGER, allowNull: true }, // record row id if exists
    MACHINE_ID: { type: DataTypes.INTEGER, allowNull: true },
    MATERIAL_ID: { type: DataTypes.INTEGER, allowNull: true },

    MACHINE_NAME: { type: DataTypes.STRING, allowNull: true },
    MATERIAL_NAME: { type: DataTypes.STRING, allowNull: true },

    PROD_DATE: { type: DataTypes.DATEONLY, allowNull: true },
    SHIFT: { type: DataTypes.ENUM('A', 'B', 'C'), allowNull: true },

    USER_ID: { type: DataTypes.INTEGER, allowNull: true },
    USER_NAME: { type: DataTypes.STRING, allowNull: true },

    ACTION: {
      type: DataTypes.ENUM('EKLEME', 'GUNCELLEME', 'SILME'),
      allowNull: false,
    },

    QUANTITY_CHANGED: { type: DataTypes.DECIMAL(18, 3), allowNull: true },
    PREVIOUS_QUANTITY: { type: DataTypes.DECIMAL(18, 3), allowNull: true },
    NEW_QUANTITY: { type: DataTypes.DECIMAL(18, 3), allowNull: true },

    DETAILS: { type: DataTypes.TEXT, allowNull: true },

    CREATED_AT: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'WEB_PRODUCTION_LOG',
    timestamps: false,
  }
)

module.exports = ProductionLog
