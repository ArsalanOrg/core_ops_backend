const { DataTypes } = require('sequelize')
const sequelize = require('../../sequelize')

const AuthorizedUser = sequelize.define(
  'WEB_INVENTORY_AUTH_USER',
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    USER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'WEB_INVENTORY_AUTH_USER',
    timestamps: false,
  }
)

module.exports = AuthorizedUser
