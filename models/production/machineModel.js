const { DataTypes } = require('sequelize')
const sequelize = require('../../sequelize')

const Machine = sequelize.define(
  'Machine',
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    NAME: { type: DataTypes.STRING, allowNull: false },
    MACHINE_CODE: { type: DataTypes.STRING, allowNull: true }, // optional internal code
    SERIAL_NO: { type: DataTypes.STRING, allowNull: true },
    DESCRIPTION: { type: DataTypes.TEXT, allowNull: true },

    STATUS: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // 1 active, 0 inactive
    DELETE_STATUS: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

    DATE_ADDED: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    UPDATE_DATE: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'WEB_PRODUCTION_MACHINE',
    timestamps: false,
  }
)

module.exports = Machine
