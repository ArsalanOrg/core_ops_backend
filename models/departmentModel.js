//models/departmentModel.js
const sequelize = require('../sequelize')
const { Sequelize, DataTypes } = require('sequelize')
// model should consist of the following fields:
// id, name, description, date_created, date_updated, code and status

const Department = sequelize.define(
  'DEPARTMENTS',
  {
    DepartmentID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    DateCreated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    DateUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    Code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    Status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'DEPARTMENTS',
    freezeTableName: true,
    timestamps: false,
  }
)
module.exports = Department
