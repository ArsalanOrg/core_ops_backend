const webpush = require('web-push')
// const vapidKeys = webpush.generateVAPIDKeys()

// console.log(vapidKeys);
webpush.setVapidDetails(
  'mailto:arslan.rehman@epikrobotik.com',
  'BEAI1t5XRkyUVc3SIfkn-J5uXHmmBM2R_nZ2UEs3Md6275Sa96J-XoPXUOBJHtT3ge7X41TyulMWXXGWJzthAuU',
  'iKehFbG_-qxEj_013FO2lfzTdtlIp3E-5EkTzyExZ_A'
)
let subscriptions = []

exports.subscribe = (req, res) => {
  const { subscription } = req.body
  const UserID = req.user.dataValues.ID
  
  const jwt = req.headers['authorization'].split(' ')[1]
  // const token =
  // console.log('Bearer Token:', jwt)
  // console.log(req.headers)

  // Check if a subscription with the same UserID already exists
  const existingIndex = subscriptions.findIndex((sub) => sub.jwt === jwt)

  if (existingIndex !== -1) {
    // Update the existing subscription
    subscriptions[existingIndex].subscription = subscription
    console.log(`Updated subscription for JWT: ${jwt}`)
  } else {
    // Add new subscription if UserID is not found
    subscriptions.push({ UserID, subscription, jwt })
    // console.log(`Added subscription for UserID: ${UserID}`)
  }

  res.status(201).json({ message: 'Subscribed successfully!' })
}

exports.unSubscribe = (req, res) => {
  const jwt = req.headers['authorization'].split(' ')[1]

  // const { jwt } = req.body
  subscriptions = subscriptions.filter((sub) => sub.jwt !== jwt)
  console.log(subscriptions)

  res.status(200).json({ message: 'Unsubscribed successfully!' })
}

exports.sendNotification = (title, body, notificationType, userIds) => {
  const payload = JSON.stringify({ title, body })

  // Always work with numbers (or always strings—just be consistent)
  const targetUserIds = (Array.isArray(userIds) ? userIds : [userIds]).map(
    (id) => Number(id)
  )

  // (All your types do the same thing anyway)
  const validTypes = new Set([
    'repair',
    'newTask',
    'taskUpdate',
    'taskComplete',
    'comment',
    'newOrder',
    'newMessage',
  ])
  if (!validTypes.has(notificationType)) {
    console.warn(`Invalid notification type: ${notificationType}`)
    return
  }

  const matched = subscriptions.filter((sub) =>
    targetUserIds.includes(Number(sub.UserID))
  )

  if (matched.length === 0) {
    console.warn(
      `No subscriptions found for user(s): ${targetUserIds.join(', ')}`
    )
    console.log(
      'Current subs:',
      subscriptions.map((s) => ({
        UserID: s.UserID,
        jwt: s.jwt.slice(0, 12) + '...',
      }))
    )
    return
  }

  matched.forEach((sub) => {
    webpush
      .sendNotification(sub.subscription, payload)
      .then(() => console.log(`Notification sent to UserID: ${sub.UserID}`))
      .catch((err) => console.error(`Error sending to ${sub.UserID}:`, err))
  })

  console.log(`Notification triggered for users: ${targetUserIds.join(', ')}`)
}

