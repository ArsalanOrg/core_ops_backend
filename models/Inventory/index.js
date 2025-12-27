// models/index.js
const sequelize = require('../../sequelize')
const Inventory = require('./inventoryModel')
const InventoryLog = require('./inventoryLogModel')
const Category = require('./categoryModel')
const Location = require('./locationsModel')
const AuthorizedUser = require('./inventoryAuthModel')

// — Associations —
// Inventory ↔ Category
Category.hasMany(Inventory, { foreignKey: 'CATEGORY' })
Inventory.belongsTo(Category, { foreignKey: 'CATEGORY', as: 'category' })

// Inventory ↔ Location
Location.hasMany(Inventory, { foreignKey: 'LOCATION' })
Inventory.belongsTo(Location, { foreignKey: 'LOCATION', as: 'location' })

// Inventory ↔ InventoryLog
Inventory.hasMany(InventoryLog, { foreignKey: 'INVENTORY_ID' })
InventoryLog.belongsTo(Inventory, { foreignKey: 'INVENTORY_ID' })

module.exports = {
  sequelize,
  Inventory,
  InventoryLog,
  Category,
  Location,
  AuthorizedUser,
}
// — End of Associations —