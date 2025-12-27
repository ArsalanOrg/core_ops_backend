// controllers/userController.js
const User = require('../models/userModel')
const { getPool } = require('../utils/pool')

// Helper: pick only allowed fields from req.body
const pickUserFields = ({
  Name,
  Surname,
  Department,
  Phone,
  Mail,
  Role,
  DepartmentRole,
  UserStatus,
  Password,
  UserName,
  SKOD1,
  SKOD2,
  SKOD3,
  SKOD4,
  NKOD1,
  NKOD2,
  NKOD3,
  NKOD4,
}) => ({
  Name,
  Surname,
  Department,
  Phone,
  Mail,
  Role,
  DepartmentRole,
  UserStatus,
  Password,
  UserName,
  SKOD1,
  SKOD2,
  SKOD3,
  SKOD4,
  NKOD1,
  NKOD2,
  NKOD3,
  NKOD4,
})

// GET /users - fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    // get all users with status 1
    const users = await User.findAll({
      where: {
        UserStatus: 1,
      },
    })
    res.status(200).json({
      status: 'success',
      message: 'Users fetched successfully',
      data: users,
    })
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: err.message,
    })
  }
}

// GET /users/:id - fetch a single user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params
  try {
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: `User with id=${id} not found`,
      })
    }
    res.status(200).json({
      status: 'success',
      message: 'User fetched successfully',
      data: user,
    })
  } catch (err) {
    console.error(`Error fetching user ${id}:`, err)
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: err.message,
    })
  }
}

// POST /users - create a new user
exports.createUser = async (req, res) => {
  if (!req.body.UserName) {
    return res.status(400).json({
      status: 'error',
      message: 'UserName is required',
    })
  }

  const payload = pickUserFields(req.body)

  try {
    const newUser = await User.create(payload)
    // remove password from response
    newUser.Password = undefined

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: newUser,
    })
  } catch (err) {
    console.error('Error creating user:', err)
    res.status(400).json({
      status: 'error',
      message: 'Failed to create user',
      error: err.message,
    })
  }
}

// PUT /users/:id - update an existing user
exports.updateUser = async (req, res) => {
  const { id } = req.params
  try {
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: `User with id=${id} not found`,
      })
    }

    const updates = pickUserFields(req.body)
    await user.update(updates)

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: user,
    })
  } catch (err) {
    console.error(`Error updating user ${id}:`, err)
    res.status(400).json({
      status: 'error',
      message: 'Failed to update user',
      error: err.message,
    })
  }
}

// DELETE /users/:id - soft delete by setting UserStatus = -1
exports.deleteUser = async (req, res) => {
  const { id } = req.params
  try {
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: `User with id=${id} not found`,
      })
    }

    await user.update({ UserStatus: -1 })

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: user,
    })
  } catch (err) {
    console.error(`Error deleting user ${id}:`, err)
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      error: err.message,
    })
  }
}
// updatePassword


exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, password: newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Both oldPassword and new password are required.',
      })
    }

    const userName = req.user.dataValues.UserName
    const pool = await getPool()

    // 1) Decrypt stored password
    const decryptResult = await pool
      .request()
      .input('UserName', sql.NVarChar(256), userName)
      .execute('CoreOps.dbo.spDecryptPasswordByUserName')

    const decrypted = decryptResult.recordset[0]?.DecryptedPassword
    if (!decrypted || decrypted !== oldPassword) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect.',
      })
    }

    // 2) Encrypt the new password
    const encryptResult = await pool
      .request()
      .input('PlainPassword', sql.NVarChar(255), newPassword)
      .output('EncryptedPassword', sql.VarBinary(sql.MAX))
      .execute('CoreOps.dbo.spEncryptPassword')

    const encryptedBlob = encryptResult.output.EncryptedPassword
    if (!encryptedBlob) {
      throw new Error('Encryption SP did not return any data.')
    }

    // 3) Write the encrypted blob back to user_table
    await pool
      .request()
      .input('EncryptedPassword', sql.VarBinary(sql.MAX), encryptedBlob)
      .input('UserName', sql.NVarChar(256), userName).query(`
        UPDATE user_table
        SET PASSWORD = @EncryptedPassword
        WHERE USERNAME = @UserName
      `)

    // 4) Success
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully.',
    })
  } catch (error) {
    console.error('updatePassword error:', error)
    res.status(400).json({
      status: 'fail',
      message: 'Failed to update password.',
      error: error.message,
    })
  }
}