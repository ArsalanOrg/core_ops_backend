const express = require('express')
const router = express.Router()

const projectController = require('../../controllers/projectManagement/projectController')
const authController = require('../../controllers/authController')

router.get(
  '/getProjects',
  authController.protect,
  projectController.getAllProjects
)

router.post(
  '/createProject',
  authController.protect,
  projectController.createProject
)

router.post(
  '/updateProject',
  authController.protect,
  projectController.updateProject
)

router.post(
  '/deleteProject',
  authController.protect,
  projectController.deleteProject
)
router.get(
  '/getProjectById/:id',
  authController.protect,
  projectController.getProjectById
)

module.exports = router
