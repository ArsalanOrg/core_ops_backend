// models/taskModel.js
const sequelize = require('../../sequelize')
const { DataTypes } = require('sequelize')

const Task = sequelize.define(
  'web_pm_tasks',
  {
    TASKID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'TASKID',
    },
    PROJECTID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'PROJECTID',
    },
    ASSIGNED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'ASSIGNED_BY',
    },
    ASSIGNED_TO: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'ASSIGNED_TO',
    },
    NAME: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      field: 'NAME',
    },
    DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'DESCRIPTION',
    },
    STAGE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'STAGE',
    },
    DELETE_STATUS: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'DELETE_STATUS',
    },
    STATUS: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'STATUS',
    },
    START_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'START_DATE',
    },
    DUE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'DUE_DATE',
    },
    FINISH_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'FINISH_DATE',
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
    COMPLETE_STATUS: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'COMPLETE_STATUS',
    },
    COMMENT_COUNT: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'COMMENT_COUNT',
    },
    COMMENT_STATUS: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'COMMENT_STATUS',
    },
    UPDATE_USER: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'UPDATE_USER',
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
  },
  {
    tableName: 'WEB_PM_TASKS',
    timestamps: false,
  }
)

module.exports = Task
