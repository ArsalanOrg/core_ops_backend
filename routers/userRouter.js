// routes/userRouter.js

const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

// Public auth routes
router.post('/login', authController.login)
router.get('/logout', authController.logout)

// Protect all routes after this middleware
router.use(authController.protect)

// User CRUD
router
  .route('/')
  .get(userController.getAllUsers) // GET /users
  .post(
    authController.restrictTo(3),
    userController.createUser
  ) // POST /users

router
  .route('/:id')
  .get(userController.getUserById) // GET /users/:id
  .put(authController.restrictTo(3), userController.updateUser) // PUT /users/:id
  .delete(authController.restrictTo(3), userController.deleteUser) // DELETE /users/:id
  router.route('/updatePassword').post(userController.updatePassword)

module.exports = router
