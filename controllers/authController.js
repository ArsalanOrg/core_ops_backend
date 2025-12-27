// controllers/authController.js

const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const User = require('../models/userModel')
const sequelize = require('../sequelize')

// <-- import Op here
const { QueryTypes, Op } = require('sequelize')

// 1) Sign JWT with the userName payload
const signToken = (userName) =>
  jwt.sign({ userName }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

// 2) Create cookie + JSON response (hiding password)
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.UserName)

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  if (isNaN(cookieOptions.expires))
    throw new Error('Invalid expiration date for the cookie')

  res.cookie('jwt', token, cookieOptions)

  // hide password field
  user.Password = undefined

  res.status(statusCode).json({
    status: 'success',
    data: { token, user },
  })
}

// POST /login
exports.login = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body
  if (!userName || !password) {
    return next(new AppError('Please provide userName and password!', 400))
  }

  // 1) find user record (exclude soft-deleted via Op.ne)
  const user = await User.findOne({
    where: {
      UserName: userName,
      UserStatus: { [Op.ne]: -1 },
    },
  })
  if (!user) {
    return next(new AppError('Incorrect userName or password', 401))
  }

  // 2) decrypt via stored procedure
  const [row] = await sequelize.query(
    `EXEC spDecryptPasswordByUserName @UserName = :un`,
    {
      replacements: { un: userName },
      type: QueryTypes.SELECT,
    }
  )

  const decrypted = row?.DecryptedPassword
  if (!decrypted || decrypted !== password) {
    return next(new AppError('Incorrect userName or password', 401))
  }

  // 3) OK → send token
  createSendToken(user, 200, res)
})

// Protect routes middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token
  // 1) Get token from header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in.', 401))
  }

  // 2) Verify token
  let decoded
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(
        new AppError('Your session has expired. Please log in again.', 401)
      )
    }
    return next(new AppError('Invalid token. Please log in again.', 401))
  }

  // 3) Check if user still exists & not soft-deleted
  const currentUser = await User.findOne({
    where: {
      UserName: decoded.userName,
      UserStatus: { [Op.ne]: -1 },
    },
  })
  if (!currentUser) {
    return next(new AppError('The user for this token no longer exists.', 401))
  }

  // 4) Grant access
  req.user = currentUser
  next()
})

// Restrict to specific roles
exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.Role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      )
    }
    next()
  }
}

// Optional: logout clears the cookie
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })
  res.status(200).json({ status: 'success' })
}
