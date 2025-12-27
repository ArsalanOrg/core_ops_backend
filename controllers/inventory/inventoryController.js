const { Op } = require('sequelize')
const {
  Inventory,
  Category,
  Location,
  AuthorizedUser,
  InventoryLog,
} = require('../../models/Inventory/index')
const User = require('../../models/userModel')
const sequelize = require('../../sequelize')

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

//////////////////////////// INVENTORY ////////////////////////////

exports.getAllInventory = async (req, res) => {
  try {
    const inventoryItems = await Inventory.findAll({
      where: { DELETE_STATUS: 0 },
      include: [
        { model: Category, as: 'category', attributes: ['ID', 'NAME'] },
        { model: Location, as: 'location', attributes: ['ID', 'NAME'] },
      ],
    })

    if (inventoryItems.length > 0) {
      res.status(200).json({
        success: true,
        message: 'Inventory items retrieved successfully.',
        data: inventoryItems,
      })
    } else {
      res.status(200).json({
        success: true,
        message: 'No inventory items found.',
        data: [],
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving inventory items.',
      error: error.message,
    })
  }
}

exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params
    const inventoryItem = await Inventory.findByPk(id)

    if (inventoryItem) {
      res.status(200).json({
        success: true,
        message: `Inventory item with ID ${id} retrieved successfully.`,
        data: inventoryItem,
      })
    } else {
      res.status(404).json({
        success: false,
        message: `No inventory item found with ID ${id}.`,
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the inventory item.',
      error: error.message,
    })
  }
}

exports.createInventoryItem = async (req, res) => {
  try {
    const userId = req.user.dataValues.ID
    const role = req.user.dataValues.Role
    const fullName = req.user.dataValues.FullName
    if (!(await checkInventoryAuthFunc(userId)) && role !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Sadece yetkili kullanıcılar tarafından oluşturulabilir.',
      })
    }

    const {
      ITEM_NAME,
      CATEGORY,
      DESCRIPTION,
      QUANTITY_IN_STOCK,
      REORDER_LEVEL,
      SUPPLIER_ID,
      UNIT_PRICE,
      RETAIL_PRICE,
      LOCATION,
      BARCODE,
      IMAGE_URL,
      PRODUCT_IMAGE,
      PRODUCT_STATUS,
      DELETE_STATUS = 0,
    } = req.body

    const newItem = await Inventory.create({
      ITEM_NAME,
      CATEGORY,
      DESCRIPTION,
      QUANTITY_IN_STOCK,
      REORDER_LEVEL,
      SUPPLIER_ID,
      UNIT_PRICE,
      RETAIL_PRICE,
      LOCATION,
      BARCODE,
      IMAGE_URL,
      PRODUCT_IMAGE,
      DELETE_STATUS,
      PRODUCT_STATUS,
    })
    await InventoryLog.create({
      INVENTORY_ID: newItem.ID,
      INVENTORY_NAME: newItem.ITEM_NAME,
      USER_NAME: fullName,
      ACTION: 'EKLEME',
      USER_ID: userId,
      PREVIOUS_QUANTITY: null,
      NEW_QUANTITY: newItem.QUANTITY_IN_STOCK,
      DETAILS: `${fullName} tarafından ${newItem.ITEM_NAME} eklendi.`,
    })
    res.status(201).json({
      success: true,
      message: 'New inventory item created successfully.',
      data: newItem,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create new inventory item.',
      error: error.message,
    })
  }
}

exports.updateInventoryItem = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const userId = req.user.dataValues.ID
    const role = req.user.dataValues.Role
    const fullName = req.user.dataValues.FullName
    const { id } = req.params

    // 1) Authorization
    if (role !== 3) {
      const isAuth = await checkInventoryAuthFunc(userId)
      if (!isAuth) {
        await t.rollback()
        return res.status(403).json({
          success: false,
          message: 'Sadece yetkili kullanıcılar tarafından güncellenebilir.',
        })
      }
    }

    // 2) Fetch "before" state
    const before = await Inventory.findByPk(id, { transaction: t })
    if (!before) {
      await t.rollback()
      return res.status(404).json({
        success: false,
        message: `No inventory item found with ID ${id}.`,
      })
    }

    // 3) Perform update
    const [updatedRows] = await Inventory.update(req.body, {
      where: { ID: id },
      transaction: t,
    })
    if (updatedRows === 0) {
      await t.rollback()
      return res.status(404).json({
        success: false,
        message: `No changes made or item not found with ID ${id}.`,
      })
    }

    // 4) Fetch "after" state
    const after = await Inventory.findByPk(id, { transaction: t })

    // 5) Log the change
    await InventoryLog.create(
      {
        INVENTORY_ID: id,
        INVENTORY_NAME: after.ITEM_NAME,
        USER_ID: userId,
        USER_NAME: fullName,
        ACTION: 'GUNCELLEME',
        QUANTITY_CHANGED: after.QUANTITY_IN_STOCK - before.QUANTITY_IN_STOCK,
        PREVIOUS_QUANTITY: before.QUANTITY_IN_STOCK,
        NEW_QUANTITY: after.QUANTITY_IN_STOCK,
        DETAILS: `${fullName} tarafından '${before.ITEM_NAME}' güncellendi.`,
      },
      { transaction: t }
    )

    await t.commit()
    return res.status(200).json({
      success: true,
      message: `Inventory item with ID ${id} updated successfully.`,
      data: after,
    })
  } catch (error) {
    await t.rollback()
    console.error('updateInventoryItem error:', error)
    return res.status(400).json({
      success: false,
      message: 'Failed to update inventory item.',
      error: error.message,
    })
  }
}

exports.deleteInventoryItem = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const userId = req.user.dataValues.ID
    const role = req.user.dataValues.Role
    const fullName = req.user.dataValues.FullName
    const { id } = req.params

    // 1) auth check
    if (role !== 3) {
      const isAuth = await checkInventoryAuthFunc(userId)
      if (!isAuth) {
        await t.rollback()
        return res.status(403).json({
          success: false,
          message: 'Sadece yetkili kullanıcılar tarafından silinebilir.',
        })
      }
    }

    // 2) fetch existing item
    const before = await Inventory.findByPk(id, { transaction: t })
    if (!before) {
      await t.rollback()
      return res.status(404).json({
        success: false,
        message: `No inventory item found with ID ${id}.`,
      })
    }

    // 3) soft-delete
    const [deletedRows] = await Inventory.update(
      { DELETE_STATUS: 1 },
      { where: { ID: id }, transaction: t }
    )

    if (deletedRows === 0) {
      await t.rollback()
      return res.status(404).json({
        success: false,
        message: `No inventory item found with ID ${id}.`,
      })
    }

    // 4) log it
    await InventoryLog.create(
      {
        INVENTORY_ID: id,
        INVENTORY_NAME: before.ITEM_NAME,
        USER_ID: userId,
        USER_NAME: fullName,
        ACTION: 'SILME',
        QUANTITY_CHANGED: before.QUANTITY_IN_STOCK,
        PREVIOUS_QUANTITY: before.QUANTITY_IN_STOCK,
        NEW_QUANTITY: 0,
        DETAILS: `${fullName} silme işlemi uyguladı: ${before.ITEM_NAME}`,
      },
      { transaction: t }
    )

    await t.commit()
    return res.status(200).json({
      success: true,
      message: `Inventory item with ID ${id} marked as deleted successfully.`,
    })
  } catch (error) {
    await t.rollback()
    console.error('deleteInventoryItem error:', error)
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the inventory item.',
      error: error.message,
    })
  }
}

exports.searchInventoryItems = async (req, res) => {
  try {
    const { query } = req.query
    const inventoryItems = await Inventory.findAll({
      where: {
        ITEM_NAME: { [Op.like]: `%${query}%` },
        DELETE_STATUS: 0,
      },
      include: [
        { model: Category, as: 'category', attributes: ['ID', 'NAME'] },
        { model: Location, as: 'location', attributes: ['ID', 'NAME'] },
      ],
    })

    res.status(200).json({
      success: true,
      message: inventoryItems.length
        ? `Found ${inventoryItems.length} matching inventory items.`
        : 'No matching inventory items found.',
      data: inventoryItems,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while searching for inventory items.',
      error: error.message,
    })
  }
}
//////////////////////////// Inventory Category  ////////////////////////////
exports.getAllCategory = async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { DELETE_STATUS: 0 } })

    res.status(200).json({
      success: true,
      message: 'All categories retrieved successfully.',
      data: categories,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching categories.',
      error: error.message,
    })
  }
}

// create a new category
exports.createCategory = async (req, res) => {
  try {
    const { NAME, DESCRIPTION } = req.body
    const isAuth = await checkInventoryAuthFunc(req.user.dataValues.ID)
    if (!isAuth && req.user.dataValues.Role !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Sadece yetkili kullanıcılar tarafından olusturulabilir.',
      })
    }
    const newCategory = await Category.create({
      NAME,
      DESCRIPTION,
      DELETE_STATUS: 0,
    })
    res.status(201).json({
      success: true,
      message: 'New category created successfully.',
      data: newCategory,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create new category.',
      error: error.message,
    })
  }
}

// update a category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { NAME, DESCRIPTION, DELETE_STATUS } = req.body
    const isAuth = await checkInventoryAuthFunc(req.user.dataValues.ID)
    if (!isAuth && req.user.dataValues.Role !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Sadece yetkili kullanıcılar tarafından güncellenebilir.',
      })
    }
    const [updatedRows] = await Category.update(
      { NAME, DESCRIPTION, DELETE_STATUS },
      { where: { ID: id } }
    )
    if (updatedRows > 0) {
      const updatedCategory = await Category.findByPk(id)
      res.status(200).json({
        success: true,
        message: `Category with ID ${id} updated successfully.`,
        data: updatedCategory,
      })
    } else {
      res.status(404).json({
        success: false,
        message: `No category found with ID ${id}, or no changes made.`,
      })
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update category.',
      error: error.message,
    })
  }
}

// delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    const isAuth = await checkInventoryAuthFunc(req.user.dataValues.ID)
    if (!isAuth && req.user.dataValues.Role !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Sadece yetkili kullanıcılar tarafından silinebilir.',
      })
    }
    const [deletedRows] = await Category.update(
      { DELETE_STATUS: 1 },
      { where: { ID: id } }
    )
    if (deletedRows > 0) {
      return res.status(200).json({
        success: true,
        message: `Category with ID ${id} marked as deleted successfully.`,
      })
    }
    res.status(404).json({
      success: false,
      message: `No category found with ID ${id}.`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the category.',
      error: error.message,
    })
  }
}

//////////////////////////// LOCATIONS ////////////////////////////

// GET /locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({ where: { DELETE_STATUS: 0 } })
    res.status(200).json({
      success: true,
      message: 'All locations retrieved successfully.',
      data: locations,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching locations.',
      error: error.message,
    })
  }
}

exports.createLocation = async (req, res) => {
  try {
    const { NAME, DESCRIPTION, COORDINATES } = req.body
    const isAuth = await checkInventoryAuthFunc(req.user.dataValues.ID)
    if (!isAuth && req.user.dataValues.Role !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Sadece yetkili kullanıcılar tarafından olusturulabilir.',
      })
    }
    const newLocation = await Location.create({
      NAME,
      DESCRIPTION,
      COORDINATES,
      DELETE_STATUS: 0,
    })
    res.status(201).json({
      success: true,
      message: 'New location created successfully.',
      data: newLocation,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create new location.',
      error: error.message,
    })
  }
}

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params
    const { NAME, DESCRIPTION, DELETE_STATUS, COORDINATES } = req.body
    const isAuth = await checkInventoryAuthFunc(req.user.dataValues.ID)
    if (!isAuth && req.user.dataValues.Role !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Sadece yetkili kullanıcılar tarafından güncellenebilir.',
      })
    }
    const [updatedRows] = await Location.update(
      { NAME, DESCRIPTION, DELETE_STATUS, COORDINATES },
      { where: { ID: id } }
    )
    if (updatedRows > 0) {
      const updatedLocation = await Location.findByPk(id)
      res.status(200).json({
        success: true,
        message: `Location with ID ${id} updated successfully.`,
        data: updatedLocation,
      })
    } else {
      res.status(404).json({
        success: false,
        message: `No location found with ID ${id}, or no changes made.`,
      })
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update location.',
      error: error.message,
    })
  }
}

// DELETE /locations/:id
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params
    const isAuth = await checkInventoryAuthFunc(req.user.dataValues.ID)
    if (!isAuth && req.user.dataValues.Role !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Sadece yetkili kullanıcılar tarafından silinebilir.',
      })
    }
    const [deletedRows] = await Location.update(
      { DELETE_STATUS: 1 },
      { where: { ID: id } }
    )
    if (deletedRows > 0) {
      return res.status(200).json({
        success: true,
        message: `Location with ID ${id} marked as deleted successfully.`,
      })
    }
    res.status(404).json({
      success: false,
      message: `No location found with ID ${id}.`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the location.',
      error: error.message,
    })
  }
}

//////////////////////////// LOGS ////////////////////////////

exports.stockOut = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const userId = req.user.dataValues.ID
    const fullName = req.user.dataValues.FullName
    const role = req.user.dataValues.Role
    const { id } = req.params
    let { quantity, purpose } = req.body

    // 0.5) Authorization check
    // only admins (role===3) or explicitly authorized users can do a stock-out
    if (role !== 3) {
      const isAuth = await checkInventoryAuthFunc(userId)
      if (!isAuth) {
        await t.rollback()
        return res.status(403).json({
          success: false,
          message: 'Bu işlemi gerçekleştirmek için yetkiniz yok.',
        })
      }
    }
    // 0) Validate quantity
    quantity = parseInt(quantity, 10)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      await t.rollback()
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer.',
      })
    }

    // 1) fetch item
    const item = await Inventory.findByPk(id, { transaction: t })
    if (!item) {
      await t.rollback()
      return res
        .status(404)
        .json({ success: false, message: 'Item not found.' })
    }
    if (item.QUANTITY_IN_STOCK < quantity) {
      await t.rollback()
      return res
        .status(400)
        .json({ success: false, message: 'Insufficient stock.' })
    }

    // 2) decrement stock
    const prevQty = item.QUANTITY_IN_STOCK
    const newQty = prevQty - quantity
    await item.update({ QUANTITY_IN_STOCK: newQty }, { transaction: t })

    // 3) log the stock-out
    const log = await InventoryLog.create(
      {
        INVENTORY_ID: id,
        INVENTORY_NAME: item.ITEM_NAME,
        USER_ID: userId, // if you’ve added USER_ID
        USER_NAME: fullName,
        ACTION: 'DEPO_CIKISI', // make sure this matches your ENUM
        QUANTITY_CHANGED: quantity,
        PREVIOUS_QUANTITY: prevQty,
        NEW_QUANTITY: newQty,
        DETAILS: purpose,
      },
      { transaction: t }
    )

    await t.commit()

    res.status(200).json({
      success: true,
      message: `Removed ${quantity} units from item ${id}.`,
      data: { item, log },
    })
  } catch (error) {
    await t.rollback()
    console.error('stockOut error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}



exports.getAllInventoryLogs = async (req, res) => {
  try {
    const {
      action,         // EKLEME | GUNCELLEME | SILME | DEPO_CIKISI
      inventoryName,  // partial match on INVENTORY_NAME
      userName,       // partial match on USER_NAME
      dateFrom,       // YYYY-MM-DD
      dateTo,         // YYYY-MM-DD
    } = req.query

    // Check if *any* filter was provided
    const hasFilter =
      action ||
      inventoryName ||
      userName ||
      dateFrom ||
      dateTo

    // Build options common to all queries
    const findOpts = {
      order: [['CREATED_AT', 'DESC']],
    }

    // Only build a WHERE if at least one filter was set
    if (hasFilter) {
      const where = {}

      if (action)        where.ACTION         = action
      if (inventoryName) where.INVENTORY_NAME = { [Op.like]: `%${inventoryName}%` }
      if (userName)      where.USER_NAME      = { [Op.like]: `%${userName}%` }

      if (dateFrom && dateTo) {
        where.CREATED_AT = {
          [Op.between]: [ new Date(dateFrom), new Date(dateTo) ]
        }
      } else if (dateFrom) {
        where.CREATED_AT = { [Op.gte]: new Date(dateFrom) }
      } else if (dateTo) {
        where.CREATED_AT = { [Op.lte]: new Date(dateTo) }
      }

      findOpts.where = where
    }

    const logs = await InventoryLog.findAll(findOpts)

    res.status(200).json({
      success: true,
      message: 'Inventory logs fetched successfully.',
      data: logs,
    })
  } catch (error) {
    console.error('getAllInventoryLogs error', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
