const jwt = require('jsonwebtoken')
const { getPool } = require('./pool')
const userInfo = async (UserName) => {
  const pool = await getPool()
  const result = await pool
    .request()
    .input('UserName', sql.VarChar, UserName)
    .query('SELECT * FROM user_table WHERE UserName = @UserName')

  var user = result.recordset[0]
  return user
}

const socketAuth = async (socket, next) => {
  const token = socket.handshake.auth?.token

  if (!token) {
    return next(new Error('Authentication token is required'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    socket.user = await userInfo(decoded.userName)
    // console.log('decoded:', socket.user)
    next()
  } catch (error) {
    next(new Error('Authentication failed: Invalid token'))
  }
}

module.exports = socketAuth
