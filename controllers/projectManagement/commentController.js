// controllers/projectManagement/commentController.js
const { Op } = require('sequelize')
const Comment = require('../../models/PM/commentModel')
const Task = require('../../models/PM/taskModel')
const Observer = require('../../models/PM/observerModel')
const Log = require('../../models/PM/logModel')
const User = require('../../models/userModel')
const { getCurrentLocalDate } = require('../../utils/helperFunctions')

// GET /comments – fetch comments by TASKID or COMMENTID, include commenter's user name
exports.getComments = async (req, res) => {
  const { TASKID = 0, COMMENTID = 0 } = req.body
  if (!TASKID && !COMMENTID) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'TASKID or COMMENTID required.' })
  }

  try {
    // build filter
    const where = {}
    if (TASKID) where.TASKID = TASKID
    if (COMMENTID) where.COMMENTID = COMMENTID

    // fetch comments
    const comments = await Comment.findAll({ where, order: [['DATE', 'DESC']] })

    // collect unique user IDs as numbers
    const userIds = [...new Set(comments.map((c) => Number(c.USERID)))]
    const users = await User.findAll({
      where: { ID: { [Op.in]: userIds } },
      attributes: ['ID', 'UserName', 'FullName'],
    })

    // build name map
    const nameMap = {}
    users.forEach((u) => {
      nameMap[u.ID] = u.FullName || u.UserName
    })

    // attach UserName and convert USERID to number for each comment
    const result = comments.map((c) => {
      const json = c.toJSON()
      const uid = Number(json.USERID)
      json.USERID = uid
      json.UserName = nameMap[uid] || null
      return json
    })

    return res.status(200).json({ status: 'success', data: result })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return res.status(500).json({ status: 'error', message: error.message })
  }
}

// POST /comments – create a comment with SP logic
exports.createComment = async (req, res) => {
  const userId = req.user.dataValues.ID
  const { TASKID, COMMENT: text } = req.body
  if (!TASKID || !text) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'TASKID and COMMENT required.' })
  }
  const now = new Date()

  try {
    // load task
    const task = await Task.findByPk(TASKID)
    if (!task) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Task not found.' })
    }
    // check permission: manager, task-user, or observer
    const isManager = task.ASSIGNED_BY === userId
    const isTaskUser = task.ASSIGNED_TO === userId
    const obs = await Observer.findOne({
      where: { TASKID, OBSERVER_USER_ID: userId },
    })
    if (!isManager && !isTaskUser && !obs) {
      return res
        .status(403)
        .json({ status: 'fail', message: 'No permission to comment.' })
    }
    // create comment
    const comment = await Comment.create({
      TASKID,
      USERID: userId,
      COMMENT: text,
      NKOD1: null,
      NKOD2: null,
      SKOD1: null,
      SKOD2: null,
      DATE: now,
      UPDATE_DATE: now,
      STATUS: 1,
      DELETE_STATUS: '0',
    })
    // update task count
    const count = await Comment.count({ where: { TASKID } })
    task.COMMENT_COUNT = count
    task.UPDATE_DATE = now
    await task.save()
    // log action
    const desc = `Yorum eklendi :  ${req.user.dataValues.UserName} >>> ${text}`
    await Log.create({
      TASKID,
      USERID: userId,
      STAGE: task.STAGE,
      TYPE: 2,
      DESCRIPTION: desc,
      STATUS: task.STATUS,
      NKOD1: comment.COMMENTID,
      NKOD2: null,
      ASSIGNED_BY: task.ASSIGNED_BY,
      ASSIGNED_TO: task.ASSIGNED_TO,
      TRIGGERED_BY: req.user.dataValues.UserName,
      TASK_NAME: task.NAME,
      SKOD1: null,
      SKOD2: null,
      SKOD3: null,
      SKOD4: null,
      DATE: now,
      UPDATE_DATE: now,
    })
    return res.status(201).json({ status: 'success', data: comment })
  } catch (error) {
    console.error('Error creating comment:', error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// PUT /comments – update a comment with SP logic
exports.updateComment = async (req, res) => {
  const userId = req.user.dataValues.ID
  const { COMMENTID, COMMENT: text } = req.body
  if (!COMMENTID || !text) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'COMMENTID and COMMENT required.' })
  }
  const now = new Date()

  try {
    const comment = await Comment.findByPk(COMMENTID)
    if (!comment) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Comment not found.' })
    }
    // load task
    const task = await Task.findByPk(comment.TASKID)
    // permission: manager, task-user, or observer
    const isManager = task.ASSIGNED_BY === userId
    const isTaskUser = task.ASSIGNED_TO === userId
    const obs = await Observer.findOne({
      where: { TASKID: task.TASKID, OBSERVER_USER_ID: userId },
    })
    if (!isManager && !isTaskUser && !obs) {
      return res
        .status(403)
        .json({ status: 'fail', message: 'No permission to update comment.' })
    }
    // update
    comment.COMMENT = text
    comment.UPDATE_DATE = now
    await comment.save()
    // log action
    const desc = `Yorum güncellendi : ${req.user.dataValues.UserName} >>> ${text}`
    await Log.create({
      TASKID: task.TASKID,
      USERID: userId,
      STAGE: task.STAGE,
      TYPE: 2,
      DESCRIPTION: desc,
      STATUS: task.STATUS,
      NKOD1: COMMENTID,
      NKOD2: null,
      ASSIGNED_BY: task.ASSIGNED_BY,
      ASSIGNED_TO: task.ASSIGNED_TO,
      TRIGGERED_BY: req.user.dataValues.UserName,
      TASK_NAME: task.NAME,
      SKOD1: null,
      SKOD2: null,
      SKOD3: null,
      SKOD4: null,
      DATE: now,
      UPDATE_DATE: now,
    })
    return res.status(200).json({ status: 'success', data: comment })
  } catch (error) {
    console.error(`Error updating comment ${COMMENTID}:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}

// DELETE /comments – delete a comment with SP logic
exports.deleteComment = async (req, res) => {
  const userId = req.user.dataValues.ID
  const role = req.user.dataValues.Role
  const deptRole = req.user.dataValues.DepartmentRole
  const { COMMENTID } = req.body
  if (!COMMENTID) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'COMMENTID required.' })
  }
  const now = new Date()

  try {
    const comment = await Comment.findByPk(COMMENTID)
    if (!comment) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Comment not found.' })
    }
    // only dept-head or board can delete
    if (deptRole !== 2 && role !== 3) {
      return res
        .status(403)
        .json({ status: 'fail', message: 'No permission to delete comment.' })
    }
    const task = await Task.findByPk(comment.TASKID)
    const text = comment.COMMENT
    // delete comment
    await comment.destroy()
    // update task count
    const count = await Comment.count({ where: { TASKID: task.TASKID } })
    task.COMMENT_COUNT = count
    task.UPDATE_DATE = now
    await task.save()
    // log action
    const desc = `Yorum silindi: ${COMMENTID} --- ${text}`
    await Log.create({
      TASKID: task.TASKID,
      USERID: userId,
      STAGE: task.STAGE,
      TYPE: 2,
      DESCRIPTION: desc,
      STATUS: task.STATUS,
      NKOD1: COMMENTID,
      NKOD2: null,
      ASSIGNED_BY: task.ASSIGNED_BY,
      ASSIGNED_TO: task.ASSIGNED_TO,
      TRIGGERED_BY: req.user.dataValues.UserName,
      TASK_NAME: task.NAME,
      SKOD1: null,
      SKOD2: null,
      SKOD3: null,
      SKOD4: null,
      DATE: now,
      UPDATE_DATE: now,
    })
    return res
      .status(200)
      .json({ status: 'success', message: 'Comment deleted.' })
  } catch (error) {
    console.error(`Error deleting comment ${COMMENTID}:`, error)
    return res.status(500).json({ status: 'fail', message: error.message })
  }
}
