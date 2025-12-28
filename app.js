const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const helmet = require('helmet')
const userRouter = require('./routers/userRouter')
const fs = require('fs')
app.use(express.json({ limit: '52428800' }))
const jwt = require('jsonwebtoken')
const path = require('path')
const notificationRouter = require('./routers/notificationRouter')
const projectRouter = require('./routers/projectManagement/projectRouter')
const taskRouter = require('./routers/projectManagement/taskRouter')
const observerRouter = require('./routers/projectManagement/observerRouter')
const memberRouter = require('./routers/projectManagement/memberRouter')
const commentRouter = require('./routers/projectManagement/commentRouter')
const logRouter = require('./routers/projectManagement/logRouter')
const todoListRouter = require('./routers/projectManagement/todoListRouter')
const departmentRouter = require('./routers/departmentRouter')
const inventoryRouter = require('./routers/inventoryRouter')
const chatRouter = require('./routers/chatRouter')


// Use Helmet for basic security
app.use(helmet())

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost',
    'http://localhost:3001',
    'http://10.1.205.2:3000',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://192.168.3.10:3000',
    'http://192.168.109.139:3000',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
  let ip = req.ip || req.connection.remoteAddress
  ip = ip.replace(/^::ffff:/, '')
  let username = 'Anonymous' // Default username

  // Extract the JWT token from the Authorization header
  const authHeader = req.headers['authorization']
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1] // Remove the "Bearer " part and get the token
    try {
      // Decode the token using the secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET) // Verifies and decodes the token
      username = decoded.userName || 'Anonymous' // Get the username from the token payload
    } catch (err) {
      console.error('JWT verification failed:', err)
    }
  }

  // Format timestamp into a more readable format
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  // Log data to write to the file
  const logData = {
    method: req.method,
    url: req.url,
    ip: ip,
    username: username,
    body: req.body,
    timestamp: timestamp, // Use the formatted timestamp
  }

  // console.log(`Request URL: ${req.url}`)
  // console.log('Client IP address:', ip)
  // console.log('Username:', username)

  const logDir = path.join(__dirname, 'logs') // Define the logs directory path
  const filePath = path.join(logDir, 'logs.txt') // Define the log file path

  // Check if the 'logs' directory exists, and create it if it doesn't
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true }) // Creates the directory and any missing parent directories
      console.log('Log directory created successfully!')
    } catch (err) {
      console.error('An error occurred while creating the log directory:', err)
    }
  }

  // Convert the data to a string (JSON format) and add a comma and newline at the end
  const data = JSON.stringify(logData, null, 2) + ',\n' // Add a comma followed by a newline to separate entries

  // Writing to the file using appendFileSync to keep the previous logs
  try {
    fs.appendFileSync(filePath, data) // Append to the file instead of overwriting
    // console.log('Log entry appended successfully!')
  } catch (err) {
    console.error('An error occurred while writing to the file:', err)
  }

  next()
})

app.use('/api/v1/user', userRouter)
app.use('/api/v1/notification', notificationRouter)
app.use('/api/v1/pm/project', projectRouter)
app.use('/api/v1/pm/task', taskRouter)
app.use('/api/v1/pm/observer', observerRouter)
app.use('/api/v1/pm/member', memberRouter)
app.use('/api/v1/pm/comment', commentRouter)
app.use('/api/v1/pm/log', logRouter)
app.use('/api/v1/pm/todo', todoListRouter)
app.use('/api/v1/department', departmentRouter)
app.use('/api/v1/inventory', inventoryRouter)
app.use('/api/v1/chat', chatRouter)

// need to add models

module.exports = app

