const { DELETE, UPDATE } = require('sequelize/lib/query-types')
const Task = require('../../models/todoListModel')
const { getCurrentLocalDate } = require('../../utils/helperFunctions')
// Get all tasks
exports.getAllTodo = async (req, res) => {
  try {
    // const tasks = await Task.findAll()
    const tasks = await Task.findAll({
      where: {
        USERID: req.user.dataValues.ID,
        DELETE_STATUS: 0,
      },
    })
    res.status(200).json({
      status: 'success',
      sp: 'seqlize findall is used instead of sp ',
      message: 'Tasks pulled successfully.',
      data: tasks,
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      status: 'fail',
      sp: 'seqlize findall is used instead of sp ',
      message: 'Failed to get tasks.',
      error: error.message,
    })
  }
}
// Create a new task
exports.createTodo = async (req, res) => {
  try {
    console.log(req.user.dataValues)
    
    const { title, description } = req.body
    // const localDate = await getCurrentLocalDate()
    const localDate = new Date()

    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        status: 'fail',
        message: 'Title is required and must be a string.',
      })
    }

    const newTask = await Task.create({
      TITLE: title,
      DESCRIPTION: description || '',
      COMPLETE_STATUS: 0,
      DATE: localDate,
      USERID: req.user.dataValues.ID,
      DELETE_STATUS: 0,
      PRIORITY_LEVEL: 0,
    })

    res.status(201).json({
      status: 'success',
      sp: 'seqlize create is used instead of sp ',
      message: 'Task created successfully.',
      data: newTask,
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      status: 'fail',
      sp: 'seqlize create is used instead of sp ',
      message: 'Failed to create task.',
      error: error.message,
    })
  }
}

// Update a task by ID
exports.updateTodo = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id)

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found.',
      })
    }

    await task.update(req.body)
    res.status(200).json({
      status: 'success',
      sp: 'seqlize update is used instead of sp ',
      message: 'Task updated successfully.',
      data: task,
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      status: 'fail',
      sp: 'seqlize update is used instead of sp ',
      message: 'Failed to update task.',
      error: error.message,
    })
  }
}

exports.updateCompleteStatus = async (req, res) => {
  try {
    const { id, status } = req.body
    const task = await Task.findByPk(id)

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found.',
      })
    }
    // const localDate = getCurrentLocalDate()
    const localDate = new Date()

    await task.update({ COMPLETE_STATUS: status, UPDATE_DATE: localDate })
    res.status(200).json({
      status: 'success',
      sp: 'seqlize update is used instead of sp ',
      message: 'Task updated successfully.',
      data: task,
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      status: 'fail',
      sp: 'seqlize update is used instead of sp ',
      message: 'Failed to update task.',
      error: error.message,
    })
  }
}
// Delete a task by ID
exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.body
    const userId = req.user.dataValues.ID
    // Find the task by ID
    const task = await Task.findByPk(id)

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found.',
      })
    }

    // Check if the task belongs to the authenticated user
    if (task.USERID !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this task.',
      })
    }

    // Delete the task
    // await task.destroy()
    await task.update({ DELETE_STATUS: 1 })

    res.status(200).json({
      status: 'success',
      sp: 'seqlize update is used instead of sp ',
      message: 'Task deleted successfully.',
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      status: 'fail',
      sp: 'seqlize update is used instead of sp ',
      message: 'Failed to delete task.',
      error: error.message,
    })
  }
}

// Get a task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id)
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found.',
      })
    }
    res.status(200).json({
      status: 'success',
      sp: 'seqlize findByPk is used instead of sp ',
      message: 'Task pulled successfully.',
      data: task,
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      status: 'fail',
      sp: 'seqlize findByPk is used instead of sp ',
      message: 'Failed to get task.',
      error: error.message,
    })
  }
}

// update priority level
exports.updatePriorityLevel = async (req, res) => {
  try {
    const { id, priorityLevel } = req.body
    const task = await Task.findByPk(id)

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found.',
      })
    }

    await task.update({ PRIORITY_LEVEL: priorityLevel })
    res.status(200).json({
      status: 'success',
      sp: 'seqlize update is used instead of sp ',
      message: 'Task updated successfully.',
      data: task,
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      status: 'fail',
      sp: 'seqlize update is used instead of sp ',
      message: 'Failed to update task.',
      error: error.message,
    })
  }
}
