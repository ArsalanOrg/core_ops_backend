const express = require('express')
const router = express.Router()

const logController = require('../../controllers/projectManagement/logController')
const authController = require('../../controllers/authController')

router.post('/getLogById', authController.protect, logController.getLogById)

router.post('/createLog', authController.protect, logController.createLog)

router.post('/updateLog', authController.protect, logController.updateLog)

router.post('/deleteLog', authController.protect, logController.deleteLog)

router.post('/activityLog', authController.protect, logController.activityLog)

module.exports = router
