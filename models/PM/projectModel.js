// models/projectModel.js
const sequelize = require('../../sequelize')
const { DataTypes } = require('sequelize')

const Project = sequelize.define(
  'web_pm_projects',
  {
    PROJECTID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'PROJECTID',
    },
    MANAGERID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'MANAGERID',
    },
    DEPARTMENTID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'DEPARTMENTID',
    },
    NAME: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      field: 'NAME',
    },
    TYPE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TYPE',
    },
    ACRHIEVE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'ACRHIEVE',
    },
    DELETE_STATUS: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'DELETE_STATUS',
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
    DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'DATE',
    },
    UPDATEDATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'UPDATEDATE',
    },
    START_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'START_DATE',
    },
    FINISH_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'FINISH_DATE',
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'UPDATE_DATE',
    },
    CURRENT_USERID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'CURRENT_USERID',
    },
    UPDATE_USERID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'UPDATE_USERID',
    },
  },
  {
    tableName: 'WEB_PM_PROJECTS',
    timestamps: false,
  }
)

module.exports = Project
