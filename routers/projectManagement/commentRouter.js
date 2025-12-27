const express = require('express')
const router = express.Router()

const commentController = require('../../controllers/projectManagement/commentController')
const authController = require('../../controllers/authController')

router.post(
  '/getComments',
  authController.protect,
  commentController.getComments
)

router.post(
  '/addComment',
  authController.protect,
  commentController.createComment
)

router.post(
  '/updateComment',
  authController.protect,
  commentController.updateComment
)

router.post(
  '/deleteComment',
  authController.protect,
  commentController.deleteComment
)

module.exports = router
