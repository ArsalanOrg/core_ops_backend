exports.sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case '\0':
          return '\\0'
        case '\x08':
          return '\\b'
        case '\x09':
          return '\\t'
        case '\x1a':
          return '\\z'
        case '\n':
          return '\\n'
        case '\r':
          return '\\r'
        case '"':
        case "'":
        case '\\':
        case '%':
          return '\\' + char
        default:
          return char
      }
    })
  } else if (typeof input === 'number') {
    return input // Numbers are safe to use directly
  } else if (input === null || input === undefined) {
    return null // Handle null or undefined
  } else {
    return input.toString() // Convert other types to string and sanitize
  }
}

exports.getUserIp = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  return ip.split(',')[0].trim()
}

exports.getCurrentLocalDate = () => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date
}
