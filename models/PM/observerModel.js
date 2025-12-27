// models/observerModel.js
const sequelize = require('../../sequelize')
const { DataTypes } = require('sequelize')

const Observer = sequelize.define(
  'web_pm_observers',
  {
    OBSERVERID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'OBSERVERID',
    },
    TASKID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TASKID',
    },
    OBSERVER_USER_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'OBSERVER_USER_ID',
    },
    DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'DATE',
    },
    STATUS: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'STATUS',
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'UPDATE_DATE',
    },
  },
  {
    tableName: 'WEB_PM_OBSERVERS',
    timestamps: false,
  }
)

module.exports = Observer
