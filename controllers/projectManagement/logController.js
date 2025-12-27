// controllers/projectManagement/logController.js
const { Op } = require('sequelize')
const Log = require('../../models/PM/logModel')
const { getCurrentLocalDate } = require('../../utils/helperFunctions')
const User = require('../../models/userModel')

// POST /getLogById – fetch logs for current user, optionally by specific LOGID
exports.getLogById = async (req, res) => {
  const userId = req.user.dataValues.ID
  const { LOGID } = req.body

  try {
    const where = { USERID: userId }
    if (LOGID !== undefined) where.LOGID = LOGID

    const logs = await Log.findAll({ where, order: [['DATE', 'DESC']] })
    if (logs.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'No logs found.' })
    }

    return res.status(200).json({ status: 'success', data: logs })
  } catch (error) {
    console.error('Error fetching logs by id:', error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /createLog – insert a new log entry
exports.createLog = async (req, res) => {
  const userId = req.user.dataValues.ID
  const {
    TASKID,
    STAGE = 0,
    TYPE = 0,
    DESCRIPTION = null,
    STATUS = 1,
    NKOD1 = null,
    NKOD2 = null,
    NKOD3 = null,
    NKOD4 = null,
    SKOD1 = null,
    SKOD2 = null,
    SKOD3 = null,
    SKOD4 = null,
  } = req.body

  if (!TASKID) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'TASKID is required.' })
  }
  const now = getCurrentLocalDate()

  try {
    const newLog = await Log.create({
      TASKID,
      USERID: userId,
      STAGE,
      TYPE,
      DESCRIPTION,
      STATUS,
      NKOD1,
      NKOD2,
      NKOD3,
      NKOD4,
      SKOD1,
      SKOD2,
      SKOD3,
      SKOD4,
      DATE: now,
      UPDATE_DATE: now,
    })
    return res.status(201).json({ status: 'success', data: newLog })
  } catch (error) {
    console.error('Error creating log:', error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /updateLog – update an existing log entry
exports.updateLog = async (req, res) => {
  const userId = req.user.dataValues.ID
  const {
    LOGID,
    TASKID,
    STAGE,
    TYPE,
    DESCRIPTION,
    STATUS,
    NKOD1,
    NKOD2,
    NKOD3,
    NKOD4,
    SKOD1,
    SKOD2,
    SKOD3,
    SKOD4,
  } = req.body

  if (!LOGID) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'LOGID is required.' })
  }
  const now = getCurrentLocalDate()

  try {
    // ensure ownership
    const log = await Log.findOne({ where: { LOGID, USERID: userId } })
    if (!log) {
      return res.status(404).json({
        status: 'fail',
        message: 'Log not found or not owned by user.',
      })
    }

    if (TASKID !== undefined) log.TASKID = TASKID
    if (STAGE !== undefined) log.STAGE = STAGE
    if (TYPE !== undefined) log.TYPE = TYPE
    if (DESCRIPTION !== undefined) log.DESCRIPTION = DESCRIPTION
    if (STATUS !== undefined) log.STATUS = STATUS
    if (NKOD1 !== undefined) log.NKOD1 = NKOD1
    if (NKOD2 !== undefined) log.NKOD2 = NKOD2
    if (NKOD3 !== undefined) log.NKOD3 = NKOD3
    if (NKOD4 !== undefined) log.NKOD4 = NKOD4
    if (SKOD1 !== undefined) log.SKOD1 = SKOD1
    if (SKOD2 !== undefined) log.SKOD2 = SKOD2
    if (SKOD3 !== undefined) log.SKOD3 = SKOD3
    if (SKOD4 !== undefined) log.SKOD4 = SKOD4
    log.UPDATE_DATE = now

    await log.save()
    return res.status(200).json({ status: 'success', data: log })
  } catch (error) {
    console.error(`Error updating log ${LOGID}:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /deleteLog – remove a log entry
exports.deleteLog = async (req, res) => {
  const userId = req.user.dataValues.ID
  const { LOGID } = req.body

  if (!LOGID) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'LOGID is required.' })
  }

  try {
    // ensure ownership
    const deleted = await Log.destroy({ where: { LOGID, USERID: userId } })
    if (!deleted) {
      return res.status(404).json({
        status: 'fail',
        message: 'Log not found or not owned by user.',
      })
    }
    return res
      .status(200)
      .json({ status: 'success', message: 'Log deleted successfully.' })
  } catch (error) {
    console.error(`Error deleting log ${LOGID}:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /activityLog – fetch task/comment logs, with permission
exports.activityLog = async (req, res) => {
  const userId = req.user.dataValues.ID
  const role = req.user.dataValues.Role // 1:user, 2:admin, 3:board

  try {
    // 1) build your WHERE
    let where = { TYPE: { [Op.in]: [1, 2] } }
    if (role === 1) {
      where[Op.or] = [
        { USERID: userId },
        { ASSIGNED_BY: userId },
        { ASSIGNED_TO: userId },
      ]
    }

    // 2) fetch logs
    const logs = await Log.findAll({
      where,
      order: [['DATE', 'DESC']],
      raw: true, // return plain objects
      attributes: {
        exclude: [
          '_previousDataValues',
          '_options',
          '_changed',
          'uniqno',
          'isNewRecord',
        ],
      },
    })

    // 3) collect all the IDs we need to look up
    const ids = new Set()
    logs.forEach((l) => {
      if (l.USERID) ids.add(l.USERID)
      if (l.ASSIGNED_BY) ids.add(l.ASSIGNED_BY)
      if (l.ASSIGNED_TO) ids.add(l.ASSIGNED_TO)
    })

    // 4) bulk‐fetch those users
    const users = await User.findAll({
      where: { ID: [...ids] },
      attributes: ['ID', 'FullName'],
      raw: true,
    })
    const nameById = users.reduce((m, u) => {
      m[u.ID] = u.FullName
      return m
    }, {})

    // 5) rewrite each log entry
    const mapped = logs.map((l) => ({
      ...l,
      USERID: nameById[l.USERID] || null,
      ASSIGNED_BY: nameById[l.ASSIGNED_BY] || null,
      ASSIGNED_TO: nameById[l.ASSIGNED_TO] || null,
    }))

    // 6) return
    return res.status(200).json({ status: 'success', data: mapped })
  } catch (error) {
    console.error('Error fetching activity log:', error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}