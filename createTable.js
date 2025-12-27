const sequelize = require('./sequelize')
// const Product = require('./models/productModel')
// const Task = require('./models/todoListModel')
// const Chat = require('./models/chatModel')
// const InventoryLog = require('./models/inventoryLogModel')
// const Inventory = require('./models/inventoryModel')
// const UserTable = require('./models/userModel')
// const Department = require('./models/departmentModel')
// const TODO = require('./models/todoListModel')

// create all pm related tables
// require('./models/PM/projectModel')
// require('./models/PM/taskModel')
// require('./models/PM/memberModel')
// require('./models/PM/observerModel')
// require('./models/PM/commentModel')
// require('./models/PM/logModel')

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// create all inventory related tables
// require('./models/Inventory/inventoryAuthModel')
// require('./models/Inventory/categoryModel')
// require('./models/Inventory/inventoryModel')
// require('./models/Inventory/inventoryLogModel')
// require('./models/Inventory/locationsModel')
////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Function to sync the Product model with the database
async function createTable() {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
    // drop InventoryLog table
    // await InventoryLog.drop()
    // Sync the Product model
    // await UserTable.sync({ force: true })
    // await Department.sync({ force: true })
    // await TODO.sync({ alter: true })
    await sequelize.sync({ alter: true })

    // await Department.sync({ alter: true })
    // await InventoryLog.sync({ force: true }) // Change to 'force: true' to drop and recreate table
    // console.log(
    //   `The table for the ${InventoryLog.name} model was just created!`
    // )
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  } finally {
    await sequelize.close()
  }
}

createTable()
