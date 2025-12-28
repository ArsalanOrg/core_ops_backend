const Chat = require('../models/chatModel')
const { Op } = require('sequelize')
const { getPool } = require('../utils/pool')
const { sendNotification } = require('./notificationController')
const sequelize = require('../sequelize')

// Send a new message
exports.sendMessage = async (req, res) => {
  const { message, receiverId } = req.body
  console.log(message, receiverId)

  try {
    const newMessage = await Chat.create({
      MESSAGE: message,
      SENDERID: req.user.dataValues.ID,
      RECEIVERID: receiverId,
    })
    res.status(200).json({
      status: 'success',
      message: 'Message sent successfully',
      data: newMessage,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'fail',
      message: 'Failed to send message',
      error: error,
    })
  }
}

// Get chat history between two users

exports.getChatHistory = async (req, res) => {
  const { receiverId } = req.body
  const senderId = req.user.dataValues.ID
  try {
    const chatHistory = await Chat.findAll({
      where: {
        [Op.or]: [
          { SENDERID: senderId, RECEIVERID: receiverId },
          { SENDERID: receiverId, RECEIVERID: senderId },
        ],
      },
      order: [['DATE', 'ASC']],
    })

    res.status(200).json({
      status: 'success',
      message: 'Chat history retrieved successfully',
      data: chatHistory,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'fail',
      message: 'Failed to retrieve chat history',
      error: error.message,
    })
  }
}

exports.chatableUserList = async (req, res) => {
  try {
    const pool = await getPool()
    const result = await pool
      .request()
      .query(`select * from user_table where UserStatus<>-1;`)

    let data = result.recordset

    // Remove the current user from the list
    data = data.filter((user) => user.ID !== req.user.dataValues.ID)

    // Add unread message count for each user
    const newData = await Promise.all(
      data.map(async (user) => {
        const unreadMessages = await Chat.count({
          where: {
            SENDERID: user.ID,
            RECEIVERID: req.user.dataValues.ID,
            READ_STATUS: 0,
          },
        })
        user.UNREAD_MESSAGE_COUNT = unreadMessages
        return user
      })
    )

    // console.log(newData)

    res.status(200).json({
      status: 'success',
      message: 'Users pulled successfully',
      data: newData,
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      status: 'fail',
      message: 'Failed to get users.',
      error: error.message,
    })
  }
}

exports.getUnreadMessageCount = async (req, res) => {
  try {
    const count = await Chat.findAll({
      where: {
        RECEIVERID: req.user.dataValues.ID,
        READ_STATUS: 0,
      },
      attributes: ['ID', 'SENDERID', 'RECEIVERID', 'MESSAGE', 'DATE'],
    })
    res.status(200).json({
      status: 'success',
      message: 'Message count retrieved successfully',
      data: count,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'fail',
      message: 'Failed to retrieve message count',
      error: error.message,
    })
  }
}

exports.handleSendMessage = async (socket, io, { message, receiverId }) => {
  try {
    console.log(message, receiverId);
    
    const newMessage = await Chat.create({
      MESSAGE: message,
      SENDERID: socket.user.ID,
      RECEIVERID: receiverId,
      READ_STATUS: 0,
    })
    const senderFullName = socket.user.FullName
    sendNotification(
      `${senderFullName} tarafından gelen mesaj`,
      message,
      'newMessage',
      receiverId
    )
    const receiverSockets = [...io.sockets.sockets.values()].filter((s) => {
      return s.user && s.user.ID === receiverId
    })
    // console.log(typeof receiverSockets)
    const senderSockets = [...io.sockets.sockets.values()].filter((s) => {
      return s.user && s.user.ID === socket.user.ID
    })
    // Broadcast the message to all connected clients
    // io.emit('messageReceived', newMessage)
    receiverSockets.forEach((socket) => {
      socket.emit('messageReceived', newMessage)
    })
    senderSockets.forEach((socket) => {
      socket.emit('messageReceived', newMessage)
    })
  } catch (error) {
    console.error('Error saving message:', error)
    socket.emit('error', { message: 'Failed to send message' })
  }
}

// Handle fetching chat history
exports.handleGetChatHistory = async (socket, { senderId, receiverId }) => {
  try {
    const chatHistory = await Chat.findAll({
      where: {
        [Op.or]: [
          { SENDERID: socket.user.ID, RECEIVERID: receiverId },
          { SENDERID: receiverId, RECEIVERID: socket.user.ID },
        ],
      },
      order: [['DATE', 'ASC']],
    })

    socket.emit('chatHistory', chatHistory)
  } catch (error) {
    console.error('Error fetching chat history:', error)
    socket.emit('error', { message: 'Failed to fetch chat history' })
  }
}

exports.handleMessageRead = async (socket, io, { messageId: messageId }) => {
  try {
    const updateReadStatus = await Chat.findByPk(messageId)
    const senderId = updateReadStatus.SENDERID
    const senderSockets = [...io.sockets.sockets.values()].filter((s) => {
      return s.user && s.user.ID === senderId
    })
    // console.log('messageid', senderId)

    if (!updateReadStatus) {
      return socket.emit('error', { message: 'Message not found' })
    }

    // updateReadStatus.READ_STATUS = 1
    // await updateReadStatus.save()
    await updateReadStatus.update({ READ_STATUS: 1 })

    senderSockets.forEach((socket) => {
      socket.emit('messageRead', messageId)
    })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    socket.emit('error', { message: 'Failed to fetch chat history' })
  }
}
