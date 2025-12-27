const { DataTypes } = require('sequelize')
const sequelize = require('../sequelize')

const Chat = sequelize.define(
  'WEB_CHAT',
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MESSAGE: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    SENDERID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RECEIVERID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DATE: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    READ_STATUS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    NKOD1: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    NKOD2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    SKOD1: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    SKOD2: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'WEB_CHAT',
    timestamps: false,
  }
)

module.exports = Chat
