const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const chatController = require('../controllers/chatController')

router.post('/sendMessage', authController.protect, chatController.sendMessage)
router.post(
  '/getChatHistory',
  authController.protect,
  chatController.getChatHistory
)
// chatableUsers
router.get(
  '/chatableUserList',
  authController.protect,
  chatController.chatableUserList
)
// getUnreadMessageCount
router.get(
  '/getUnreadMessageCount',
  authController.protect,
  chatController.getUnreadMessageCount
)

module.exports = router
