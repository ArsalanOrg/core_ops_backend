const express = require('express')
const router = express.Router()

const authController = require('../../controllers/authController')
const todoListController = require('../../controllers/projectManagement/todoListController')

router.get(
  '/getAllTodo',
  authController.protect,
  todoListController.getAllTodo
)

router.post(
  '/createTodo',
  authController.protect,
  todoListController.createTodo
)

router.post(
  '/updateCompleteStatus',
  authController.protect,
  todoListController.updateCompleteStatus
)

router.patch(
  '/updateTodo/:id',
  authController.protect,
  todoListController.updateTodo
)

router.post(
  '/deleteTodo',
  authController.protect,
  todoListController.deleteTodo
)

router.post('/updatePriorityLevel', todoListController.updatePriorityLevel)

module.exports = router
