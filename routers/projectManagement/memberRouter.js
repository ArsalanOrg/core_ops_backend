const express = require('express')
const router = express.Router()
const memberController = require('../../controllers/projectManagement/memberController')
const authController = require('../../controllers/authController')

router.get(
  '/getMembers',
  authController.protect,
  memberController.getAllMembers
)

router.post('/addMember', authController.protect, memberController.addMember)

router.post(
  '/deleteMember',
  authController.protect,
  memberController.deleteMember
)

router.post(
  '/projectMembersList',
  authController.protect,
  memberController.projectMembersList
)

module.exports = router
