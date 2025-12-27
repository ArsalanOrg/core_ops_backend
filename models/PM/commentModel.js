// models/commentModel.js
const sequelize = require('../../sequelize')
const { DataTypes } = require('sequelize')

const Comment = sequelize.define(
  'web_pm_comment',
  {
    COMMENTID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'COMMENTID',
    },
    TASKID: {
      type: DataTypes.CHAR(10),
      allowNull: true,
      field: 'TASKID',
    },
    USERID: {
      type: DataTypes.CHAR(10),
      allowNull: true,
      field: 'USERID',
    },
    COMMENT: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'COMMENT',
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
    UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'UPDATE_DATE',
    },
    STATUS: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'STATUS',
    },
    DELETE_STATUS: {
      type: DataTypes.CHAR(10),
      allowNull: true,
      field: 'DELETE_STATUS',
    },
  },
  {
    tableName: 'WEB_PM_COMMENT',
    timestamps: false,
  }
)

module.exports = Comment
