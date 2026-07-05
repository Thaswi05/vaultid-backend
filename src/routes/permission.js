const express = require('express')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')

const router = express.Router()

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// GRANT permission to a website
router.post('/grant', verifyToken, async (req, res) => {
  try {
    const { websiteId, canSeeName, canSeeEmail, canSeePhone, canSeeDob, canSeeAddress } = req.body
    const userId = req.user.userId

    // Check if permission already exists
    const existing = await prisma.permission.findFirst({
      where: { userId, websiteId }
    })

    if (existing) {
      // Update existing permission
      const updated = await prisma.permission.update({
        where: { id: existing.id },
        data: { canSeeName, canSeeEmail, canSeePhone, canSeeDob, canSeeAddress }
      })
      return res.json({ message: 'Permissions updated!', permission: updated })
    }

    // Create new permission
    const permission = await prisma.permission.create({
      data: {
        userId,
        websiteId,
        canSeeName: canSeeName || false,
        canSeeEmail: canSeeEmail || false,
        canSeePhone: canSeePhone || false,
        canSeeDob: canSeeDob || false,
        canSeeAddress: canSeeAddress || false
      }
    })

    res.status(201).json({ message: 'Permission granted!', permission })

  } catch (error) {
    console.error('PERMISSION ERROR:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// GET all permissions for logged in user
router.get('/my-permissions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId

    const permissions = await prisma.permission.findMany({
      where: { userId },
      include: { website: true }
    })

    res.json({ permissions })

  } catch (error) {
    console.error('GET PERMISSIONS ERROR:', error.message)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router