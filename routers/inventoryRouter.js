const express = require('express')
const inventoryController = require('../controllers/inventory/inventoryController')
const authController = require('../controllers/authController')
const router = express.Router()

//////////////////////////// Inventory Authorization  ////////////////////////////
// addAuthorizedUser
router.post(
  '/addAuthorizedUser',
  authController.protect,
  authController.restrictTo(3),
  inventoryController.addAuthorizedUser
)
router.get(
  '/checkInventoryAuth',
  authController.protect,
  inventoryController.checkInventoryAuth
)
// getAllAuthorizedUsers
router.get(
  '/getAllAuthorizedUsers',
  authController.protect,
  inventoryController.getAllAuthorizedUsers
)
// removeAuthorizedUser
router.post(
  '/removeAuthorizedUser/:id',
  authController.protect,
  authController.restrictTo(3),
  inventoryController.removeAuthorizedUser
)

//////////////////////////// Inventory Items  ////////////////////////////
router.get(
  '/getAllInventory',
  authController.protect,
  inventoryController.getAllInventory
)
router.post(
  '/getInventoryById/:id',
  authController.protect,
  inventoryController.getInventoryById
)
router.post(
  '/createInventory',
  authController.protect,
  inventoryController.createInventoryItem
)
router.put(
  '/updateInventory/:id',
  authController.protect,
  inventoryController.updateInventoryItem
)
router.post(
  '/deleteInventory/:id',
  authController.protect,
  inventoryController.deleteInventoryItem
)
router.get(
  '/inventory/search',
  authController.protect,
  inventoryController.searchInventoryItems
)

//////////////////////////// Inventory Categories  ////////////////////////////
router.post(
  '/createCategory',
  authController.protect,
  inventoryController.createCategory
)

router.get(
  '/getAllCategory',
  authController.protect,
  inventoryController.getAllCategory
)
//updateCategory
router.put(
  '/updateCategory/:id',
  authController.protect,
  inventoryController.updateCategory
)
router.post(
  '/deleteCategory/:id',
  authController.protect,
  inventoryController.deleteCategory
)

///////////////////////////////////// LOCATIONS /////////////////////////////////////

router.get(
  '/getAllLocations',
  authController.protect,
  inventoryController.getAllLocations
)
// createLocation
router.post(
  '/createLocation',
  authController.protect,
  inventoryController.createLocation
)
// updateLocation
router.put(
  '/updateLocation/:id',
  authController.protect,
  inventoryController.updateLocation
)
// deleteLocation
router.post(
  '/deleteLocation/:id',
  authController.protect,
  inventoryController.deleteLocation
)


///////////////////////////////////// LOGS /////////////////////////////////////
// stockOut
router.post(
  '/stockOut/:id',
  authController.protect,
  inventoryController.stockOut
)
// getAllInventoryLogs
router.get(
  '/getAllInventoryLogs',
  authController.protect,
  inventoryController.getAllInventoryLogs
)

module.exports = router
