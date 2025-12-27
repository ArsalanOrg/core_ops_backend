// controllers/projectManagement/observerController.js
const { Op } = require('sequelize')
const Observer = require('../../models/PM/observerModel')
const Task = require('../../models/PM/taskModel')
const User = require('../../models/userModel')
const userController = require('../userController')
const { getCurrentLocalDate } = require('../../utils/helperFunctions')

// GET /observers – fetch observer entries
exports.getObservers = async (req, res) => {
  const userId = req.user.dataValues.ID
  const deptRole = req.user.dataValues.DepartmentRole // 2=dept head, 3=board

  try {
    const where = {}
    if (deptRole !== 2) {
      // non-board sees only their own observer entries
      where.OBSERVER_USER_ID = userId
    }

    const observers = await Observer.findAll({
      where,
      order: [['DATE', 'DESC']],
    })

    // collect unique observer user IDs
    const userIds = [
      ...new Set(observers.map((o) => Number(o.OBSERVER_USER_ID))),
    ]
    const users = await User.findAll({
      where: { ID: { [Op.in]: userIds } },
      attributes: ['ID', 'UserName', 'FullName'],
    })

    // build a map from ID to display name
    const nameMap = {}
    users.forEach((u) => {
      nameMap[u.ID] = u.FullName || u.UserName
    })

    // attach UserName to each observer record
    const result = observers.map((o) => {
      const json = o.toJSON()
      json.OBSERVER_USER_ID = Number(json.OBSERVER_USER_ID)
      json.UserName = nameMap[json.OBSERVER_USER_ID] || null
      return json
    })

    return res.status(200).json({
      status: 'success',
      message: 'Observers fetched successfully.',
      data: result,
    })
  } catch (error) {
    console.error('Error fetching observers:', error)
    return res.status(500).json({
      status: 'fail',
      message: 'Failed to get observers.',
      error: error.message,
    })
  }
}


// POST /observers – add this user or another as observer for a task
exports.createObserver = async (req, res) => {
  const requestingUser = req.user.dataValues.ID
  const { TASKID, OBSERVER_USER_ID, STATUS = 1 } = req.body

  if (!TASKID || !OBSERVER_USER_ID) {
    return res.status(400).json({
      status: 'fail',
      message: 'TASKID and OBSERVER_USER_ID are required.',
    })
  }

  try {
    // optional: verify task exists
    const task = await Task.findByPk(TASKID)
    if (!task) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Task not found.' })
    }

    const now = getCurrentLocalDate()
    const newObs = await Observer.create({
      TASKID,
      OBSERVER_USER_ID,
      DATE: now,
      STATUS,
      UPDATE_DATE: now,
    })

    return res.status(201).json({
      status: 'success',
      message: 'Observer added successfully.',
      data: newObs,
    })
  } catch (error) {
    console.error('Error creating observer:', error)
    return res.status(500).json({
      status: 'fail',
      message: 'Failed to add observer.',
      error: error.message,
    })
  }
}

// DELETE /observers – remove an observer entry for the requesting user
exports.deleteObserver = async (req, res) => {
  const requestingUser = req.user.dataValues.ID
  const { TASKID } = req.body

  if (!TASKID) {
    return res.status(400).json({
      status: 'fail',
      message: 'TASKID is required.',
    })
  }

  try {
    const deleted = await Observer.destroy({
      where: {
        TASKID,
        OBSERVER_USER_ID: requestingUser,
      },
    })

    if (!deleted) {
      return res.status(404).json({
        status: 'fail',
        message: 'Observer not found or not owned by user.',
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Observer removed successfully.',
    })
  } catch (error) {
    console.error('Error deleting observer:', error)
    return res.status(500).json({
      status: 'fail',
      message: 'Failed to delete observer.',
      error: error.message,
    })
  }
}
