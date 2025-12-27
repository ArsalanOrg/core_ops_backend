const { Op } = require('sequelize')
const {
  Inventory,
  Category,
  Location,
  AuthorizedUser,
  InventoryLog,
} = require('../../models/Inventory/index')
const User = require('../../models/userModel')

//////////////////////////// Inventory Authorization  ////////////////////////////

exports.addAuthorizedUser = async (req, res) => {
  try {
    const { userIds } = req.body

    // validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds must be a non-empty array of numbers.',
      })
    }

    // for each ID, find or create
    const results = await Promise.all(
      userIds.map(async (id) => {
        const [authUser, created] = await AuthorizedUser.findOrCreate({
          where: { USER_ID: id },
        })
        return { authUser, created }
      })
    )

    // count how many were new vs existing
    const createdCount = results.filter((r) => r.created).length
    const existingCount = results.length - createdCount

    // collect all the instances to return
    const allUsers = results.map((r) => r.authUser)

    res.status(200).json({
      success: true,
      message: `${createdCount} user(s) added, ${existingCount} already authorized.`,
      data: allUsers,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /auth-users/:userId
exports.removeAuthorizedUser = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await AuthorizedUser.destroy({
      where: { USER_ID: id },
    })
    if (deleted) {
      res
        .status(200)
        .json({ success: true, message: 'Authorized user removed.' })
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found in authorized list.',
      })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /auth-users
exports.getAllAuthorizedUsers = async (req, res) => {
  try {
    // 1) fetch all auth‐user records
    const authUsers = await AuthorizedUser.findAll({ raw: true })

    // 2) collect all the USER_IDs
    const userIds = authUsers.map((a) => a.USER_ID)

    // 3) bulk‐fetch those users’ names
    const users = await User.findAll({
      where: { ID: { [Op.in]: userIds } },
      attributes: ['ID', 'FullName'],
      raw: true,
    })
    const nameById = users.reduce((map, u) => {
      map[u.ID] = u.FullName
      return map
    }, {})

    // 4) attach the name to each authUser record
    const data = authUsers.map((a) => ({
      USER_ID: a.USER_ID,
      FullName: nameById[a.USER_ID] || null,
    }))

    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Make this async and actually await the DB call:
const checkInventoryAuthFunc = async (userID) => {
  try {
    const checkUser = await AuthorizedUser.findOne({
      where: { USER_ID: userID },
    })
    return !!checkUser
  } catch (error) {
    console.log(error)

    return false
  }
}
exports.checkInventoryAuth = async (req, res) => {
  try {
    const userId = req.user.dataValues.ID
    const role = req.user.dataValues.Role
    if (role !== 3) {
      const isAuth = await checkInventoryAuthFunc(userId)

      if (!isAuth) {
        return res.status(200).json({
          success: false,
          message: 'Kullanıcının yetkisi yok.',
          data: false,
        })
      }
    }

    res.status(200).json({
      success: true,
      message: 'Kullanıcının yetkisi var.',
      data: true,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while checking inventory authorization.',
      error: error.message,
    })
  }
}
