const sequelize = require('../../sequelize')
const Machine = require('./machineModel')
const Material = require('./materialModel')
const ProductionRecord = require('./productionRecordModel')
const ProductionLog = require('./productionLogModel')
const ProductionAuthorizedUser = require('./productionAuthModel')

// Machine ↔ ProductionRecord
Machine.hasMany(ProductionRecord, { foreignKey: 'MACHINE_ID' })
ProductionRecord.belongsTo(Machine, { foreignKey: 'MACHINE_ID', as: 'machine' })

// Material ↔ ProductionRecord
Material.hasMany(ProductionRecord, { foreignKey: 'MATERIAL_ID' })
ProductionRecord.belongsTo(Material, { foreignKey: 'MATERIAL_ID', as: 'material' })

module.exports = {
  sequelize,
  Machine,
  Material,
  ProductionRecord,
  ProductionLog,
  ProductionAuthorizedUser,
}
