const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { nanoid } = require('nanoid')
const prisma = require('../prisma')

const router = express.Router()

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, dob, address, password } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique VaultID
    const vaultId = 'VID-' + nanoid(10).toUpperCase()

    // Save user to database
    const user = await prisma.user.create({
      data: {
        vaultId,
        name,
        email,
        phone,
        dob,
        address,
        password: hashedPassword
      }
    })

    res.status(201).json({
      message: 'User registered successfully!',
      vaultId: user.vaultId
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Wrong password' })
    }

    // Generate login token
    const token = jwt.sign(
      { userId: user.id, vaultId: user.vaultId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful!',
      token,
      vaultId: user.vaultId
    })

  } catch (error) {
    console.error('REGISTER ERROR:', error.message)
    console.error(error.stack)
    res.status(500).json({ error: error.message })
}
})

module.exports = router