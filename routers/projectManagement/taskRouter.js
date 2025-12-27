const express = require('express')
const router = express.Router()

const taskController = require('../../controllers/projectManagement/taskController')
const authController = require('../../controllers/authController')

router.post('/getTasks', authController.protect, taskController.getTasks)

router.post('/createTask', authController.protect, taskController.createTask)

router.post('/updateTask', authController.protect, taskController.updateTask)

router.post('/deleteTask', authController.protect, taskController.deleteTask)

router.post(
  '/getMyObservedTasks',
  authController.protect,
  taskController.getMyObservedTasks
)

router.post('/stageUpdate', authController.protect, taskController.stageUpdate)

router.post(
  '/archiveUpdate',
  authController.protect,
  taskController.archiveUpdate
)

router.post(
  '/completeUpdate',
  authController.protect,
  taskController.completeUpdate
)

router.post('/archiveTask', authController.protect, taskController.archiveTask)
// checkAuthTask
router.post(
  '/checkAuthTask',
  authController.protect,
  taskController.checkAuthTask
)

module.exports = router
