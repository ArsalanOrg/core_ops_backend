let poolPromise = null

exports.getPool = async () => {
  if (!poolPromise) {
    // Initialize the connection pool once
    poolPromise = sql
      .connect()
      .then((pool) => {
        console.log('Connected to MSSQL...')
        return pool
      })
      .catch((err) => {
        console.error('Database connection failed:', err)
        throw err
      })
  }
  return poolPromise
}
