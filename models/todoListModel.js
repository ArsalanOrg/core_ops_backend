const sequelize = require('../sequelize')
const { Sequelize, DataTypes } = require('sequelize')

const TodoTask = sequelize.define(
  `WEB_PM_TODO_LIST`,
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    TITLE: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DESCRIPTION: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    COMPLETE_STATUS: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      // allowNull: false,
    },
    DELETE_STATUS: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      // allowNull: false,
    },
    PRIORITY_LEVEL: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      // allowNull: false,
    },
    DATE: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      defaultValue: '1900-01-01T00:00:00.000Z',
    },

    USERID: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    SKOD2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
)

module.exports = TodoTask
