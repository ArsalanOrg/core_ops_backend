const { DataTypes } = require('sequelize')
const sequelize = require('../../sequelize')

const ProductionAuthorizedUser = sequelize.define(
  'ProductionAuthorizedUser',
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    USER_ID: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  },
  {
    tableName: 'WEB_PRODUCTION_AUTH_USER',
    timestamps: false,
  }
)

module.exports = ProductionAuthorizedUser
