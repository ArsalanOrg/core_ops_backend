// routes/departmentRouter.js
const express = require('express')
const router = express.Router()
const deptCtrl = require('../controllers/departmentController')
const authController = require('../controllers/authController')

router.get('/', authController.protect, deptCtrl.getAllDepartments)
router.get('/:id', authController.protect, deptCtrl.getDepartmentById)
router.post('/', authController.protect, authController.restrictTo(3), deptCtrl.createDepartment)
// router.post('/',  deptCtrl.createDepartment)
router.put('/:id', authController.protect, authController.restrictTo(3), deptCtrl.updateDepartment)
router.post('/:id', authController.protect, authController.restrictTo(3), deptCtrl.deleteDepartment)

module.exports = router
