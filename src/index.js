const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Routes
const authRoutes = require('./routes/auth')
const websiteRoutes = require('./routes/website')
const permissionRoutes = require('./routes/permission')

app.use('/api/auth', authRoutes)
app.use('/api/website', websiteRoutes)
app.use('/api/permissions', permissionRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'VaultID API is running! 🚀' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})