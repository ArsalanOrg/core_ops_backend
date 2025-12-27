// models/logModel.js
const sequelize = require('../../sequelize')
const { DataTypes } = require('sequelize')

const Log = sequelize.define(
  'web_pm_logs',
  {
    LOGID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'LOGID',
    },
    TASKID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'TASKID',
    },
    USERID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'USERID',
    },
    STAGE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'STAGE',
    },
    TYPE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TYPE',
    },
    DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'DESCRIPTION',
    },
    STATUS: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'STATUS',
    },
    ASSIGNED_TO: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'ASSIGNED_TO',
    },
    ASSIGNED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'ASSIGNED_BY',
    },
    TRIGGERED_BY: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      field: 'TRIGGERED_BY',
    },
    TASK_NAME: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      field: 'TASK_NAME',
    },
    NKOD1: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'NKOD1',
    },
    NKOD2: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'NKOD2',
    },
    NKOD3: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'NKOD3',
    },
    NKOD4: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'NKOD4',
    },
    SKOD1: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      field: 'SKOD1',
    },
    SKOD2: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      field: 'SKOD2',
    },
    SKOD3: {
      type: DataTypes.CHAR(55),
      allowNull: true,
      field: 'SKOD3',
    },
    SKOD4: {
      type: DataTypes.CHAR(55),
      allowNull: true,
      field: 'SKOD4',
    },
    DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'DATE',
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'UPDATE_DATE',
    },
  },
  {
    tableName: 'WEB_PM_LOGS',
    timestamps: false,
  }
)

module.exports = Log
