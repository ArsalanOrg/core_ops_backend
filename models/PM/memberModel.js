// models/memberModel.js
const sequelize = require('../../sequelize')
const { DataTypes } = require('sequelize')

const Member = sequelize.define(
  'web_pm_members',
  {
    MEMBERID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'MEMBERID',
    },
    PROJECTID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'PROJECTID',
    },
    USERID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'USERID',
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
  },
  {
    tableName: 'WEB_PM_MEMBERS',
    timestamps: false,
  }
)

module.exports = Member
