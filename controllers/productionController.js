const { Op, fn, col, literal } = require('sequelize')
const {
  Machine,
  Material,
  ProductionRecord,
  ProductionLog,
  ProductionAuthorizedUser,
} = require('../models/production/index')
const User = require('../models/userModel')
const sequelize = require('../sequelize')

// -------------------- Auth Helper --------------------
const checkProductionAuthFunc = async (userID) => {
  const authUser = await ProductionAuthorizedUser.findOne({ where: { USER_ID: userID } })
  return !!authUser
}

const requireProductionAuth = async (req, res) => {
  const userID = req.user?.ID
  const userRole = req.user?.Role

  if (!userID) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
    return false
  }

  // Role 3 bypass (same as your Inventory module)
  if (userRole === 3) return true

  const isAuthorized = await checkProductionAuthFunc(userID)
  if (!isAuthorized) {
    res.status(403).json({ success: false, message: 'Access denied for Production module.' })
    return false
  }
  return true
}

// -------------------- Production Authorization --------------------
exports.addAuthorizedUser = async (req, res) => {
  try {
    const { userIds } = req.body
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'userIds must be a non-empty array.' })
    }

    const results = await Promise.all(
      userIds.map(async (id) => {
        const [authUser, created] = await ProductionAuthorizedUser.findOrCreate({
          where: { USER_ID: id },
        })
        return { authUser, created }
      })
    )

    const createdCount = results.filter((r) => r.created).length
    const existingCount = results.length - createdCount
    const allUsers = results.map((r) => r.authUser)

    res.status(200).json({
      success: true,
      message: `Authorized users updated. Created: ${createdCount}, Already existed: ${existingCount}`,
      data: allUsers,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.removeAuthorizedUser = async (req, res) => {
  try {
    const { userId } = req.params
    const deleted = await ProductionAuthorizedUser.destroy({ where: { USER_ID: userId } })
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Authorized user not found.' })
    }
    res.status(200).json({ success: true, message: 'Authorized user removed.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.getAllAuthorizedUsers = async (req, res) => {
  try {
    const authUsers = await ProductionAuthorizedUser.findAll({
      attributes: ['USER_ID'],
      order: [['ID', 'DESC']],
    })

    const userIds = authUsers.map((a) => a.USER_ID)
    const users = await User.findAll({
      where: { ID: userIds },
      attributes: ['ID', 'FullName'],
    })

    const userMap = new Map(users.map((u) => [u.ID, u.FullName]))
    const response = authUsers.map((a) => ({
      USER_ID: a.USER_ID,
      FullName: userMap.get(a.USER_ID) || null,
    }))

    res.status(200).json({ success: true, data: response })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.checkProductionAuth = async (req, res) => {
  try {
    const userID = req.user?.ID
    const userRole = req.user?.Role

    if (!userID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    if (userRole === 3) {
      return res.status(200).json({ success: true, data: true })
    }

    const isAuthorized = await checkProductionAuthFunc(userID)
    res.status(200).json({ success: true, data: isAuthorized })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

// -------------------- Machines CRUD --------------------
exports.getAllMachines = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const machines = await Machine.findAll({
      where: { DELETE_STATUS: 0 },
      order: [['ID', 'DESC']],
    })
    res.status(200).json({ success: true, data: machines })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.getMachineById = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const machine = await Machine.findByPk(req.params.id)
    if (!machine || machine.DELETE_STATUS === 1) {
      return res.status(404).json({ success: false, message: 'Machine not found.' })
    }
    res.status(200).json({ success: true, data: machine })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.createMachine = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const created = await Machine.create(req.body)
    res.status(201).json({ success: true, message: 'Machine created.', data: created })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.updateMachine = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const machine = await Machine.findByPk(req.params.id)
    if (!machine || machine.DELETE_STATUS === 1) {
      return res.status(404).json({ success: false, message: 'Machine not found.' })
    }

    await machine.update({ ...req.body, UPDATE_DATE: new Date() })
    res.status(200).json({ success: true, message: 'Machine updated.', data: machine })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.deleteMachine = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const machine = await Machine.findByPk(req.params.id)
    if (!machine || machine.DELETE_STATUS === 1) {
      return res.status(404).json({ success: false, message: 'Machine not found.' })
    }

    await machine.update({ DELETE_STATUS: 1, UPDATE_DATE: new Date() })
    res.status(200).json({ success: true, message: 'Machine deleted (soft).' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

// -------------------- Materials CRUD --------------------
exports.getAllMaterials = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const materials = await Material.findAll({
      where: { DELETE_STATUS: 0 },
      order: [['ID', 'DESC']],
    })
    res.status(200).json({ success: true, data: materials })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.createMaterial = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const created = await Material.create(req.body)
    res.status(201).json({ success: true, message: 'Material created.', data: created })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.updateMaterial = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const material = await Material.findByPk(req.params.id)
    if (!material || material.DELETE_STATUS === 1) {
      return res.status(404).json({ success: false, message: 'Material not found.' })
    }
    await material.update({ ...req.body, UPDATE_DATE: new Date() })
    res.status(200).json({ success: true, message: 'Material updated.', data: material })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.deleteMaterial = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const material = await Material.findByPk(req.params.id)
    if (!material || material.DELETE_STATUS === 1) {
      return res.status(404).json({ success: false, message: 'Material not found.' })
    }
    await material.update({ DELETE_STATUS: 1, UPDATE_DATE: new Date() })
    res.status(200).json({ success: true, message: 'Material deleted (soft).' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

// -------------------- Production Record (Upsert per machine+material+date+shift) --------------------
exports.upsertProductionRecord = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) {
      await t.rollback()
      return
    }

    const userID = req.user?.ID
    const userName = req.user?.FullName || req.user?.Name || null

    const { MACHINE_ID, MATERIAL_ID, PROD_DATE, SHIFT, QUANTITY, NOTES } = req.body

    if (!MACHINE_ID || !MATERIAL_ID || !PROD_DATE || !SHIFT) {
      await t.rollback()
      return res.status(400).json({
        success: false,
        message: 'MACHINE_ID, MATERIAL_ID, PROD_DATE, SHIFT are required.',
      })
    }

    if (!['A', 'B', 'C'].includes(SHIFT)) {
      await t.rollback()
      return res.status(400).json({ success: false, message: 'SHIFT must be A, B, or C.' })
    }

    const qtyNum = Number(QUANTITY)
    if (!Number.isFinite(qtyNum) || qtyNum < 0) {
      await t.rollback()
      return res.status(400).json({ success: false, message: 'QUANTITY must be a number >= 0.' })
    }

    const machine = await Machine.findByPk(MACHINE_ID, { transaction: t })
    const material = await Material.findByPk(MATERIAL_ID, { transaction: t })

    if (!machine || machine.DELETE_STATUS === 1) {
      await t.rollback()
      return res.status(404).json({ success: false, message: 'Machine not found.' })
    }
    if (!material || material.DELETE_STATUS === 1) {
      await t.rollback()
      return res.status(404).json({ success: false, message: 'Material not found.' })
    }

    // Find existing row (same machine + material + day + shift)
    const existing = await ProductionRecord.findOne({
      where: {
        MACHINE_ID,
        MATERIAL_ID,
        PROD_DATE,
        SHIFT,
        DELETE_STATUS: 0,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    })

    if (!existing) {
      // Create
      const created = await ProductionRecord.create(
        {
          MACHINE_ID,
          MATERIAL_ID,
          PROD_DATE,
          SHIFT,
          QUANTITY: qtyNum,
          NOTES: NOTES || null,
        },
        { transaction: t }
      )

      await ProductionLog.create(
        {
          RECORD_ID: created.ID,
          MACHINE_ID,
          MATERIAL_ID,
          MACHINE_NAME: machine.NAME,
          MATERIAL_NAME: material.NAME,
          PROD_DATE,
          SHIFT,
          USER_ID: userID,
          USER_NAME: userName,
          ACTION: 'EKLEME',
          QUANTITY_CHANGED: qtyNum,
          PREVIOUS_QUANTITY: null,
          NEW_QUANTITY: qtyNum,
          DETAILS: 'Production record created',
        },
        { transaction: t }
      )

      await t.commit()
      return res.status(201).json({ success: true, message: 'Production record created.', data: created })
    }

    // Update same row + log delta
    const prevQty = Number(existing.QUANTITY || 0)
    const newQty = qtyNum
    const delta = newQty - prevQty

    await existing.update(
      {
        QUANTITY: newQty,
        NOTES: NOTES ?? existing.NOTES,
        UPDATE_DATE: new Date(),
      },
      { transaction: t }
    )

    await ProductionLog.create(
      {
        RECORD_ID: existing.ID,
        MACHINE_ID,
        MATERIAL_ID,
        MACHINE_NAME: machine.NAME,
        MATERIAL_NAME: material.NAME,
        PROD_DATE,
        SHIFT,
        USER_ID: userID,
        USER_NAME: userName,
        ACTION: 'GUNCELLEME',
        QUANTITY_CHANGED: delta,
        PREVIOUS_QUANTITY: prevQty,
        NEW_QUANTITY: newQty,
        DETAILS: 'Production record updated',
      },
      { transaction: t }
    )

    await t.commit()
    res.status(200).json({ success: true, message: 'Production record updated.', data: existing })
  } catch (err) {
    console.error(err)
    await t.rollback()
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

// List records (raw)
exports.getProductionRecords = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const { machineId, materialId, shift, dateFrom, dateTo } = req.query

    const where = { DELETE_STATUS: 0 }
    if (machineId) where.MACHINE_ID = machineId
    if (materialId) where.MATERIAL_ID = materialId
    if (shift) where.SHIFT = shift

    if (dateFrom && dateTo) {
      where.PROD_DATE = { [Op.between]: [dateFrom, dateTo] }
    } else if (dateFrom) {
      where.PROD_DATE = { [Op.gte]: dateFrom }
    } else if (dateTo) {
      where.PROD_DATE = { [Op.lte]: dateTo }
    }

    const rows = await ProductionRecord.findAll({
      where,
      include: [
        { model: Machine, as: 'machine', attributes: ['ID', 'NAME'] },
        { model: Material, as: 'material', attributes: ['ID', 'NAME', 'UNIT'] },
      ],
      order: [['PROD_DATE', 'DESC'], ['SHIFT', 'ASC'], ['ID', 'DESC']],
    })

    res.status(200).json({ success: true, data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

exports.deleteProductionRecord = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) {
      await t.rollback()
      return
    }

    const userID = req.user?.ID
    const userName = req.user?.FullName || req.user?.Name || null

    const row = await ProductionRecord.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE })
    if (!row || row.DELETE_STATUS === 1) {
      await t.rollback()
      return res.status(404).json({ success: false, message: 'Production record not found.' })
    }

    const machine = await Machine.findByPk(row.MACHINE_ID, { transaction: t })
    const material = await Material.findByPk(row.MATERIAL_ID, { transaction: t })

    const prevQty = Number(row.QUANTITY || 0)

    await row.update({ DELETE_STATUS: 1, UPDATE_DATE: new Date() }, { transaction: t })

    await ProductionLog.create(
      {
        RECORD_ID: row.ID,
        MACHINE_ID: row.MACHINE_ID,
        MATERIAL_ID: row.MATERIAL_ID,
        MACHINE_NAME: machine?.NAME || null,
        MATERIAL_NAME: material?.NAME || null,
        PROD_DATE: row.PROD_DATE,
        SHIFT: row.SHIFT,
        USER_ID: userID,
        USER_NAME: userName,
        ACTION: 'SILME',
        QUANTITY_CHANGED: -prevQty,
        PREVIOUS_QUANTITY: prevQty,
        NEW_QUANTITY: 0,
        DETAILS: 'Production record deleted (soft)',
      },
      { transaction: t }
    )

    await t.commit()
    res.status(200).json({ success: true, message: 'Production record deleted (soft).' })
  } catch (err) {
    console.error(err)
    await t.rollback()
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

// -------------------- Logs --------------------
exports.getAllProductionLogs = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const { action, machineName, materialName, userName, dateFrom, dateTo } = req.query

    const where = {}
    if (action) where.ACTION = action
    if (machineName) where.MACHINE_NAME = { [Op.like]: `%${machineName}%` }
    if (materialName) where.MATERIAL_NAME = { [Op.like]: `%${materialName}%` }
    if (userName) where.USER_NAME = { [Op.like]: `%${userName}%` }

    if (dateFrom && dateTo) {
      where.CREATED_AT = { [Op.between]: [new Date(dateFrom), new Date(dateTo)] }
    } else if (dateFrom) {
      where.CREATED_AT = { [Op.gte]: new Date(dateFrom) }
    } else if (dateTo) {
      where.CREATED_AT = { [Op.lte]: new Date(dateTo) }
    }

    const logs = await ProductionLog.findAll({
      where,
      order: [['CREATED_AT', 'DESC']],
    })

    res.status(200).json({ success: true, data: logs })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

// -------------------- Analytics (aggregated) --------------------
// 1) Daily totals (optionally filtered)
exports.getDailyTotals = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const { dateFrom, dateTo, machineId, materialId } = req.query

    const where = { DELETE_STATUS: 0 }
    if (machineId) where.MACHINE_ID = machineId
    if (materialId) where.MATERIAL_ID = materialId

    if (dateFrom && dateTo) where.PROD_DATE = { [Op.between]: [dateFrom, dateTo] }
    else if (dateFrom) where.PROD_DATE = { [Op.gte]: dateFrom }
    else if (dateTo) where.PROD_DATE = { [Op.lte]: dateTo }

    const rows = await ProductionRecord.findAll({
      where,
      attributes: [
        'PROD_DATE',
        [fn('SUM', col('QUANTITY')), 'TOTAL_QUANTITY'],
      ],
      group: ['PROD_DATE'],
      order: [['PROD_DATE', 'ASC']],
    })

    res.status(200).json({ success: true, data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

// 2) Per machine totals (leaderboard)
exports.getTopMachines = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const { dateFrom, dateTo, materialId, limit } = req.query

    const where = { DELETE_STATUS: 0 }
    if (materialId) where.MATERIAL_ID = materialId

    if (dateFrom && dateTo) where.PROD_DATE = { [Op.between]: [dateFrom, dateTo] }
    else if (dateFrom) where.PROD_DATE = { [Op.gte]: dateFrom }
    else if (dateTo) where.PROD_DATE = { [Op.lte]: dateTo }

    const rows = await ProductionRecord.findAll({
      where,
      attributes: [
        'MACHINE_ID',
        [fn('SUM', col('QUANTITY')), 'TOTAL_QUANTITY'],
      ],
      group: ['MACHINE_ID'],
      order: [[literal('TOTAL_QUANTITY'), 'DESC']],
      limit: limit ? Number(limit) : 10,
      include: [{ model: Machine, as: 'machine', attributes: ['ID', 'NAME'] }],
    })

    res.status(200).json({ success: true, data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}

// 3) Per material totals
exports.getMaterialTotals = async (req, res) => {
  try {
    const ok = await requireProductionAuth(req, res)
    if (!ok) return

    const { dateFrom, dateTo, machineId } = req.query

    const where = { DELETE_STATUS: 0 }
    if (machineId) where.MACHINE_ID = machineId

    if (dateFrom && dateTo) where.PROD_DATE = { [Op.between]: [dateFrom, dateTo] }
    else if (dateFrom) where.PROD_DATE = { [Op.gte]: dateFrom }
    else if (dateTo) where.PROD_DATE = { [Op.lte]: dateTo }

    const rows = await ProductionRecord.findAll({
      where,
      attributes: [
        'MATERIAL_ID',
        [fn('SUM', col('QUANTITY')), 'TOTAL_QUANTITY'],
      ],
      group: ['MATERIAL_ID'],
      order: [[literal('TOTAL_QUANTITY'), 'DESC']],
      include: [{ model: Material, as: 'material', attributes: ['ID', 'NAME', 'UNIT'] }],
    })

    res.status(200).json({ success: true, data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error.', error: err.message })
  }
}
