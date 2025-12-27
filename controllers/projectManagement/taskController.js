// controllers/projectManagement/taskController.js
const { Op } = require('sequelize')
const Task = require('../../models/PM/taskModel')
const Observer = require('../../models/PM/observerModel')
const Log = require('../../models/PM/logModel')
const Project = require('../../models/PM/projectModel')
const User = require('../../models/userModel')
const { sendNotification } = require('../notificationController')
const { getCurrentLocalDate } = require('../../utils/helperFunctions')

// Default filters for active tasks
const defaultTaskFilter = { DELETE_STATUS: 1, STATUS: 1 }
const defaultTaskStage = [
  'Yapılacak Görevler',
  'Devam Eden',
  'Tamamlanan',
  'Arşiv',
]

// POST /getTasks – if PROJECTID provided fetch those tasks, otherwise tasks assigned to the user
exports.getTasks = async (req, res) => {
  const userId = req.user.dataValues.ID
  const projectId = req.body.PROJECTID ? Number(req.body.PROJECTID) : null

  try {
    // Build filter
    const where = { ...defaultTaskFilter }
    if (projectId) {
      where.PROJECTID = projectId
    } else {
      where.ASSIGNED_TO = userId
    }

    // Fetch tasks
    const tasks = await Task.findAll({
      where,
      order: [
        ['PROJECTID', 'ASC'],
        ['DATE', 'DESC'],
      ],
    })

    // Fetch a single observer per task
    const taskIds = tasks.map((t) => t.TASKID)
    const observers = await Observer.findAll({
      where: { TASKID: { [Op.in]: taskIds } },
      attributes: ['TASKID', 'OBSERVER_USER_ID'],
    })
    const obsMap = observers.reduce((m, o) => {
      if (!m[o.TASKID]) m[o.TASKID] = o.OBSERVER_USER_ID
      return m
    }, {})

    // Resolve user names for ASSIGNED_BY, ASSIGNED_TO, and OBSERVER
    const idSet = new Set()
    tasks.forEach((t) => {
      idSet.add(t.ASSIGNED_BY)
      idSet.add(t.ASSIGNED_TO)
      if (obsMap[t.TASKID]) idSet.add(obsMap[t.TASKID])
    })
    const userIds = Array.from(idSet)
    const users = await User.findAll({
      where: { ID: { [Op.in]: userIds } },
      attributes: ['ID', 'UserName'],
    })
    const nameMap = {}
    users.forEach((u) => {
      nameMap[u.ID] = u.UserName
    })

    // Attach names
    const result = tasks.map((t) => {
      const json = t.toJSON()
      json.ASSIGNED_BY = nameMap[t.ASSIGNED_BY] || null
      json.ASSIGNED_TO = nameMap[t.ASSIGNED_TO] || null
      const obsUid = obsMap[t.TASKID] || null
      json.OBSERVER = obsUid ? nameMap[obsUid] : null
      return json
    })

    return res.status(200).json({
      status: 'success',
      message: 'Tasks fetched successfully.',
      data: result,
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}
// POST /createTask – only department head
exports.createTask = async (req, res) => {
  const userId = req.user.dataValues.ID
  const deptRole = req.user.dataValues.DepartmentRole
  const role = req.user.dataValues.Role
  if (role === 1) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only department head can create tasks.',
    })
  }

  const {
    PROJECTID,
    ASSIGNED_TO,
    NAME,
    DESCRIPTION,
    STAGE = 0,
    DUE_DATE,
    COMPLETE_STATUS = 0,
    COMMENT_COUNT = 0,
    COMMENT_STATUS = 1,
    OBSERVER_USER_ID,
  } = req.body

  const now = new Date()

  try {
    const task = await Task.create({
      PROJECTID,
      ASSIGNED_BY: userId,
      ASSIGNED_TO,
      NAME,
      DESCRIPTION,
      STAGE,
      DELETE_STATUS: 1,
      STATUS: 1,
      START_DATE: now,
      DUE_DATE,
      FINISH_DATE: null,
      DATE: now,
      UPDATE_DATE: now,
      COMPLETE_STATUS,
      COMMENT_COUNT,
      COMMENT_STATUS,
      UPDATE_USER: userId,
    })

    if (OBSERVER_USER_ID) {
      await Observer.create({
        TASKID: task.TASKID,
        OBSERVER_USER_ID,
        DATE: now,
        STATUS: 1,
        UPDATE_DATE: now,
      })
    }

    sendNotification(
      'New Task',
      'You have a new task assigned.',
      'newTask',
      ASSIGNED_TO
    )
    return res.status(201).json({
      status: 'success',
      message: 'Task created successfully.',
      data: task,
    })
  } catch (error) {
    console.error('Error creating task:', error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /updateTask – only department head
exports.updateTask = async (req, res) => {
  const userId = req.user.dataValues.ID
  const deptRole = req.user.dataValues.DepartmentRole
  const role = req.user.dataValues.Role
  if (role === 1) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only department head can update tasks.',
    })
  }

  const { TASKID, OBSERVER_USER_ID, ...updates } = req.body
  const now = new Date()

  try {
    const task = await Task.findByPk(TASKID)
    if (!task) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Task not found.' })
    }

    Object.entries(updates).forEach(([key, val]) => {
      if (val !== undefined && key in task) {
        task[key] = val
      }
    })
    task.UPDATE_DATE = now
    task.UPDATE_USER = userId
    await task.save()

    if (OBSERVER_USER_ID !== undefined) {
      const obs = await Observer.findOne({ where: { TASKID } })
      if (obs) {
        obs.OBSERVER_USER_ID = OBSERVER_USER_ID
        obs.UPDATE_DATE = now
        await obs.save()
      } else {
        await Observer.create({
          TASKID,
          OBSERVER_USER_ID,
          DATE: now,
          STATUS: 1,
          UPDATE_DATE: now,
        })
      }
    }

    sendNotification(
      'Task Updated',
      `Task ${TASKID} updated.`,
      'taskUpdate',
      task.ASSIGNED_TO
    )
    return res.status(200).json({
      status: 'success',
      message: 'Task updated successfully.',
      data: task,
    })
  } catch (error) {
    console.error(`Error updating task ${TASKID}:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /deleteTask – only department head
exports.deleteTask = async (req, res) => {
  const userId = req.user.dataValues.ID
  const deptRole = req.user.dataValues.DepartmentRole
  if (deptRole !== 2) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only department head can delete tasks.',
    })
  }

  const { TASKID } = req.body
  const now = new Date()

  try {
    const task = await Task.findByPk(TASKID)
    if (!task) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Task not found.' })
    }

    task.DELETE_STATUS = -1
    task.UPDATE_DATE = now
    await task.save()

    return res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully.',
      data: 'Task deleted successfully.',
    })
  } catch (error) {
    console.error(`Error deleting task ${TASKID}:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /getMyObservedTasks – fetch tasks observed by the user
// POST /getMyObservedTasks – fetch observed tasks with user-names
exports.getMyObservedTasks = async (req, res) => {
  const userId = req.user.dataValues.ID

  try {
    // 1) fetch observer records for current user
    const obs = await Observer.findAll({
      where: { OBSERVER_USER_ID: userId },
    })
    const taskIds = obs.map((o) => o.TASKID)

    // 2) fetch tasks observed by user
    const tasks = await Task.findAll({
      where: { TASKID: { [Op.in]: taskIds }, ...defaultTaskFilter },
      order: [
        ['PROJECTID', 'ASC'],
        ['DATE', 'DESC'],
      ],
    })

    // 3) resolve user names for assigned_by, assigned_to, and observer
    const idSet = new Set()
    tasks.forEach((t) => {
      idSet.add(t.ASSIGNED_BY)
      idSet.add(t.ASSIGNED_TO)
    })
    idSet.add(userId)

    const users = await User.findAll({
      where: { ID: { [Op.in]: Array.from(idSet) } },
      attributes: ['ID', 'UserName', 'FullName'],
    })
    const nameMap = {}
    users.forEach((u) => {
      nameMap[u.ID] = u.UserName
    })

    // 4) attach names to each task
    const result = tasks.map((t) => {
      const json = t.toJSON()
      json.ASSIGNED_BY = nameMap[t.ASSIGNED_BY] || null
      json.ASSIGNED_TO = nameMap[t.ASSIGNED_TO] || null
      json.OBSERVER = nameMap[userId] || null
      return json
    })

    return res.status(200).json({
      status: 'success',
      message: 'Observed tasks fetched.',
      data: result,
    })
  } catch (error) {
    console.error('Error fetching observed tasks:', error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /stageUpdate – update a task's stage with permission control
exports.stageUpdate = async (req, res) => {
  const userId = req.user.dataValues.ID
  const role = req.user.dataValues.Role
  const deptRole = req.user.dataValues.DepartmentRole
  const { TASKID, STAGE } = req.body
  const now = new Date()

  try {
    const task = await Task.findByPk(TASKID)
    if (!task) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Task not found.' })
    }
    const isAssigned = [task.ASSIGNED_BY, task.ASSIGNED_TO].includes(userId)
    if (!isAssigned && deptRole !== 2 && role !== 3) {
      return res
        .status(403)
        .json({ status: 'fail', message: 'No permission to change stage.' })
    }
    if (STAGE === 3 && deptRole !== 2 && role !== 3) {
      return res
        .status(403)
        .json({ status: 'fail', message: 'No permission to archive.' })
    }

    const prevStage = task.STAGE
    task.STAGE = STAGE
    task.UPDATE_DATE = now
    await task.save()

    await Log.create({
      TASKID,
      USERID: userId,
      STAGE,
      TYPE: 1,
      DESCRIPTION: `Durum Güncellemesi:  ${defaultTaskStage[prevStage]} >> ${defaultTaskStage[STAGE]}`,
      STATUS: task.STATUS,
      NKOD1: 0,
      NKOD2: 0,
      ASSIGNED_BY: task.ASSIGNED_BY,
      ASSIGNED_TO: task.ASSIGNED_TO,
      TRIGGERED_BY: req.user.dataValues.UserName,
      TASK_NAME: task.NAME,
      NKOD3: null,
      SKOD1: null,
      NKOD4: null,
      SKOD2: null,
      SKOD3: null,
      SKOD4: null,
      DATE: now,
      UPDATE_DATE: now,
    })

    sendNotification(
      'Task Stage Update',
      `Task ${TASKID} moved to stage ${STAGE}`,
      'taskUpdate',
      isAssigned
        ? task.ASSIGNED_BY === userId
          ? task.ASSIGNED_TO
          : task.ASSIGNED_BY
        : task.ASSIGNED_BY
    )

    return res.status(200).json({
      status: 'success',
      message: 'Stage updated successfully.',
      data: task,
    })
  } catch (error) {
    console.error(`Error updating stage of task ${TASKID}:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /archiveUpdate – toggle a task's delete status
exports.archiveUpdate = async (req, res) => {
  const role = req.user.dataValues.Role
  const deptRole = req.user.dataValues.DepartmentRole
  const { TASKID, ARCHIVE } = req.body
  const now = new Date()

  if (deptRole !== 2 && role !== 3) {
    return res
      .status(403)
      .json({ status: 'fail', message: 'No permission to archive.' })
  }

  try {
    const task = await Task.findByPk(TASKID)
    if (!task) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Task not found.' })
    }

    task.DELETE_STATUS = ARCHIVE
    task.UPDATE_DATE = now
    await task.save()

    return res.status(200).json({
      status: 'success',
      message: 'Archive status updated.',
      data: task,
    })
  } catch (error) {
    console.error(`Error updating archive of task ${TASKID}:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /completeUpdate – toggle a task's completion status
exports.completeUpdate = async (req, res) => {
  const userId = req.user.dataValues.ID
  const userName = req.user.dataValues.UserName
  const { TASKID, COMPLETE } = req.body
  const now = new Date()

  try {
    const task = await Task.findByPk(TASKID)
    if (!task) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Task not found.' })
    }
    if (task.ASSIGNED_BY !== userId) {
      return env.status(403).json({
        status: 'fail',
        message: 'Only creator can toggle completion.',
      })
    }

    const prevStage = task.STAGE
    task.COMPLETE_STATUS = COMPLETE
    task.STAGE = COMPLETE ? 2 : 1
    task.FINISH_DATE = COMPLETE ? now : null
    task.UPDATE_DATE = now
    await task.save()

    await Log.create({
      TASKID,
      USERID: userId,
      STAGE: task.STAGE,
      TYPE: 2,
      DESCRIPTION: COMPLETE
        ? `Görev ${userName} tarafından onaylandı`
        : `Görev ${userName} tarafından tekrar açıldı `,
      STATUS: task.STATUS,
      NKOD1: 0,
      NKOD2: 0,
      ASSIGNED_BY: task.ASSIGNED_BY,
      ASSIGNED_TO: task.ASSIGNED_TO,
      TRIGGERED_BY: req.user.dataValues.UserName,
      TASK_NAME: task.NAME,
      NKOD3: null,
      SKOD1: null,
      NKOD4: null,
      SKOD2: null,
      SKOD3: null,
      SKOD4: null,
      DATE: now,
      UPDATE_DATE: now,
    })

    sendNotification(
      'Task Completion',
      `Task ${TASKID} ${COMPLETE ? 'completed' : 'reopened'}`,
      'taskComplete',
      task.ASSIGNED_TO
    )

    return res.status(200).json({
      status: 'success',
      message: 'Completion status updated.',
      data: task,
    })
  } catch (error) {
    console.error(`Error toggling completion of task ${TASKID}:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// POST /archiveTask – deactivate a task (soft-delete)
exports.archiveTask = async (req, res) => {
  const role = req.user.dataValues.Role
  const deptRole = req.user.dataValues.DepartmentRole
  const { TASKID } = req.body
  const now = new Date()

  if (deptRole !== 2 && role !== 3) {
    return res
      .status(403)
      .json({ status: 'fail', message: 'No permission to archive task.' })
  }

  try {
    const task = await Task.findByPk(TASKID)
    if (!task) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Task not found.' })
    }
    task.STATUS = 0
    task.UPDATE_DATE = now
    await task.save()

    return res.status(200).json({
      status: 'success',
      message: 'Task archived successfully.',
      data: task,
    })
  } catch (error) {
    console.error(`Error archiving task ${TASKID}:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}
// create checkAuthTask function that takes user id and project id to decide if the user has authorization to create a task
exports.checkAuthTask = async (req, res) => {
  const { PROJECTID } = req.body
  const role = req.user.dataValues.Role
  const USERID = req.user.dataValues.ID

  try {
    const project = await Project.findByPk(PROJECTID)
    if (!project) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Project not found.' })
    }

    if (project.MANAGERID === USERID) {
      return res.status(200).json({
        status: 'success',
        message: ' User is authorized to create a task',
        data: true,
      })
    } else if (role === 3) {
      return res.status(200).json({
        status: 'success',
        message: ' User is authorized to create a task',
        data: true,
      })
    } else {
      return res.status(403).json({
        status: 'fail',
        message: ' User is not authorized to create a task ',
        data: false,
      })
    }
  } catch (error) {
    console.error(`Error checking authorization for task:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}
