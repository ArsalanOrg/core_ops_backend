const { Server } = require('socket.io')
const {
  handleSendMessage,
  handleGetChatHistory,
  handleMessageRead,
} = require('../controllers/chatController')
const socketAuth = require('./socketAuth')

const configureSocketIO = (server) => {
  const allowed = ['https://coreops.arsalanrehman.online', 'http://10.1.205.2:3000','http://localhost:3000'] // Adjust for production
  const io = new Server(server, {
    cors: {
      origin: allowed, // Adjust for production
      methods: ['GET', 'POST'],
    },
  })

  io.use(socketAuth)

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Event: Send message
    socket.on('sendMessage', (data) => handleSendMessage(socket, io, data))

    // Event: Get chat history
    socket.on('getChatHistory', (data) => handleGetChatHistory(socket, data))
    socket.on('messageRead', (data) => handleMessageRead(socket, io, data))

    // On Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
    })
  })
}

module.exports = configureSocketIO
