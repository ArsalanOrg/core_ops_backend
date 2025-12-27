const { Sequelize } = require('sequelize')
const dotenv = require('dotenv')

dotenv.config({ path: './config.env' })

const sequelize = new Sequelize(
  process.env.localDB,
  process.env.user,
  process.env.localPassword,
  {
    host: process.env.localServer,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    },
    logging: false,
  }
)

module.exports = sequelize