const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const notificationController = require('../controllers/notificationController')

router.post(
  '/sendNotification',
  // authController.protect,
  notificationController.sendNotification
)
router.post(
  '/subscribe',
  authController.protect,
  notificationController.subscribe
)

router.post(
  '/unSubscribe',
  authController.protect,
  notificationController.unSubscribe
)
module.exports = router
