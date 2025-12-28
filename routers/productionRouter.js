// routes/productionRoutes.js
const express = require('express')
const productionController = require('../controllers/productionController')
const authController = require('../controllers/authController')
const router = express.Router()

//////////////////////////// Production Authorization ////////////////////////////
// addAuthorizedUser (admin only)
router.post(
  '/addAuthorizedUser',
  authController.protect,
  authController.restrictTo(3),
  productionController.addAuthorizedUser
)

// checkProductionAuth
router.get(
  '/checkProductionAuth',
  authController.protect,
  productionController.checkProductionAuth
)

// getAllAuthorizedUsers
router.get(
  '/getAllAuthorizedUsers',
  authController.protect,
  productionController.getAllAuthorizedUsers
)

// removeAuthorizedUser (admin only)
router.post(
  '/removeAuthorizedUser/:userId',
  authController.protect,
  authController.restrictTo(3),
  productionController.removeAuthorizedUser
)

//////////////////////////// Machines ////////////////////////////
router.get(
  '/getAllMachines',
  authController.protect,
  productionController.getAllMachines
)

router.get(
  '/getMachineById/:id',
  authController.protect,
  productionController.getMachineById
)

router.post(
  '/createMachine',
  authController.protect,
  productionController.createMachine
)

router.put(
  '/updateMachine/:id',
  authController.protect,
  productionController.updateMachine
)

router.post(
  '/deleteMachine/:id',
  authController.protect,
  productionController.deleteMachine
)

//////////////////////////// Materials ////////////////////////////
router.get(
  '/getAllMaterials',
  authController.protect,
  productionController.getAllMaterials
)

router.post(
  '/createMaterial',
  authController.protect,
  productionController.createMaterial
)

router.put(
  '/updateMaterial/:id',
  authController.protect,
  productionController.updateMaterial
)

router.post(
  '/deleteMaterial/:id',
  authController.protect,
  productionController.deleteMaterial
)

//////////////////////////// Production Records ////////////////////////////
// Upsert (create if not exists else update) per MACHINE_ID + MATERIAL_ID + PROD_DATE + SHIFT
router.post(
  '/upsertProductionRecord',
  authController.protect,
  productionController.upsertProductionRecord
)

// List raw records (filters via query string)
router.get(
  '/getProductionRecords',
  authController.protect,
  productionController.getProductionRecords
)

// Soft delete a record by ID
router.post(
  '/deleteProductionRecord/:id',
  authController.protect,
  productionController.deleteProductionRecord
)

//////////////////////////// Analytics ////////////////////////////
router.get(
  '/analytics/dailyTotals',
  authController.protect,
  productionController.getDailyTotals
)

router.get(
  '/analytics/topMachines',
  authController.protect,
  productionController.getTopMachines
)

router.get(
  '/analytics/materialTotals',
  authController.protect,
  productionController.getMaterialTotals
)

//////////////////////////// Logs ////////////////////////////
router.get(
  '/getAllProductionLogs',
  authController.protect,
  productionController.getAllProductionLogs
)

module.exports = router
