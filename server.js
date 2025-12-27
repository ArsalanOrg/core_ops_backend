const sql = require('mssql')
const app = require('./app')
const dotenv = require('dotenv')
const https = require('https')
const http = require('http')
const fs = require('fs')
// const configureSocketIO = require('./utils/socket')

dotenv.config({ path: './config.env' })

const port = 5050

// MSSQL connection configuration
const config = {
  user: process.env.user,
  password: process.env.localPassword,
  server: process.env.localServer,
  database: process.env.localDB,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
}

// Connect to MSSQL
sql.connect(config, (err) => {
  if (err) {
    console.error('Error connecting to MSSQL:', err)
    throw err
  }
  console.log('MSSQL connected...')
  global.sql = sql
})
let server
// Path to SSL certificates
const keyPath = '/etc/letsencrypt/live/arge.boyar.com.tr/privkey.pem'
const certPath = '/etc/letsencrypt/live/arge.boyar.com.tr/fullchain.pem'

// Check if SSL certificate files exist
// if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
//   console.log('certificate found')

//   // HTTPS server options
//   const httpsOptions = {
//     key: fs.readFileSync(keyPath),
//     cert: fs.readFileSync(certPath),
//   }

//   // Start HTTPS server
//   https.createServer(httpsOptions, app).listen(port, () => {
//     console.log(HTTPS Server running on port ${port})
//   })
// } else {
//   // Start HTTP server if SSL files are not found
//   app.listen(port, () => {
//     console.log(HTTP Server running on port ${port})
//   })
// }

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('Certificate found')

  // HTTPS server options
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }

  server = https.createServer(httpsOptions, app)
  console.log(`HTTPS Server running on port ${port}`)
} else {
  server = http.createServer(app)
  console.log(`HTTP Server running on port ${port}`)
}

// Start Socket.IO server
// configureSocketIO(server)

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})