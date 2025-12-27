const express = require('express')
const router = express.Router()

const observerController = require('../../controllers/projectManagement/observerController')
const authController = require('../../controllers/authController')

router.post('/getObservers', authController.protect, observerController.getObservers)

router.post('/createObserver', authController.protect, observerController.createObserver)

router.post('/deleteObserver', authController.protect, observerController.deleteObserver)

module.exports = router

