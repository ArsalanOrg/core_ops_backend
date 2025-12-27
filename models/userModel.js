// models/userModel.js

const sequelize = require('../sequelize')
const { DataTypes, QueryTypes } = require('sequelize')

const User = sequelize.define(
  'user_table',
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'ID',
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'Name',
    },
    Surname: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'Surname',
    },
    Department: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'Department',
    },
    Phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Phone',
    },
    Mail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: { isEmail: true },
      field: 'Mail',
    },
    Role: {
      type: DataTypes.INTEGER, // 1: User, 2: Admin , 3: Board
      allowNull: false,
      field: 'Role',
    },
    DepartmentRole: {
      type: DataTypes.INTEGER, // 1: User, 2: Admin
      allowNull: true,
      field: 'DepartmentRole',
    },
    UserStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'UserStatus',
      defaultValue: 'ACTIVE',
    },
    Password: {
      type: DataTypes.BLOB,
      allowNull: false,
      field: 'Password',
    },

    // now required from client
    UserName: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: true,
      field: 'UserName',
    },
    FullName: {
      type: DataTypes.STRING(512),
      allowNull: true,
      field: 'FullName',
    },
    SKOD1: { type: DataTypes.STRING, allowNull: true, field: 'SKOD1' },
    SKOD2: { type: DataTypes.STRING, allowNull: true, field: 'SKOD2' },
    SKOD3: { type: DataTypes.STRING, allowNull: true, field: 'SKOD3' },
    SKOD4: { type: DataTypes.STRING, allowNull: true, field: 'SKOD4' },
    NKOD1: { type: DataTypes.INTEGER, allowNull: true, field: 'NKOD1' },
    NKOD2: { type: DataTypes.INTEGER, allowNull: true, field: 'NKOD2' },
    NKOD3: { type: DataTypes.INTEGER, allowNull: true, field: 'NKOD3' },
    NKOD4: { type: DataTypes.INTEGER, allowNull: true, field: 'NKOD4' },
  },
  {
    tableName: 'user_table',
    timestamps: false,

    hooks: {
      // Build FullName before any validation (create or update)
      beforeValidate: (user) => {
        const name = user.Name || ''
        const surname = user.Surname || ''
        user.FullName = `${name} ${surname}`.trim()
      },

      // On create: encrypt password
      beforeCreate: async (user) => {
        const [result] = await sequelize.query(`
          DECLARE @enc VARBINARY(MAX);
           EXEC spEncryptPassword
             @PlainPassword = :pwd,
             @EncryptedPassword = @enc OUTPUT;
           SELECT @enc AS Password;`,
          {
            replacements: { pwd: user.Password },
            type: QueryTypes.SELECT,
          }
        )
        user.Password = result.Password
      },

      // On update: rebuild FullName & encrypt if password changed
      beforeUpdate: async (user) => {
        // rebuild FullName
        const name = user.Name || ''
        const surname = user.Surname || ''
        user.FullName = `${name} ${surname}`.trim()

        // re-encrypt only if the raw Password field was changed
        if (user.changed('Password')) {
          const [result] = await sequelize.query(
            `DECLARE @enc VARBINARY(MAX);
             EXEC spEncryptPassword
               @PlainPassword = :pwd,
               @EncryptedPassword = @enc OUTPUT;
             SELECT @enc AS Password;`,
            {
              replacements: { pwd: user.Password },
              type: QueryTypes.SELECT,
            }
          )
          user.Password = result.Password
        }
      },
    },
  }
)

module.exports = User