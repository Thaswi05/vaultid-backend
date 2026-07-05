const express = require('express')
const { nanoid } = require('nanoid')
const prisma = require('../prisma')

const router = express.Router()

// REGISTER A WEBSITE (to get an API key)
router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body

    // Check if website already registered
    const existing = await prisma.website.findUnique({
      where: { email }
    })
    if (existing) {
      return res.status(400).json({ error: 'Website already registered' })
    }

    // Generate unique API key
    const apiKey = 'KEY-' + nanoid(16).toUpperCase()

    const website = await prisma.website.create({
      data: { name, email, apiKey }
    })

    res.status(201).json({
      message: 'Website registered successfully!',
      apiKey: website.apiKey
    })

  } catch (error) {
    console.error('WEBSITE REGISTER ERROR:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// LOOKUP A VAULTID (core feature)
router.get('/lookup/:vaultId', async (req, res) => {
  try {
    const { vaultId } = req.params
    const apiKey = req.headers['x-api-key']

    // Check 1 — is the website registered?
    const website = await prisma.website.findUnique({
      where: { apiKey }
    })
    if (!website) {
      return res.status(401).json({ error: 'Invalid API key' })
    }

    // Check 2 — does this VaultID exist?
    const user = await prisma.user.findUnique({
      where: { vaultId }
    })
    if (!user) {
      return res.status(404).json({ error: 'VaultID not found' })
    }

    // Check 3 — what did the user allow this website to see?
    const permission = await prisma.permission.findFirst({
      where: { userId: user.id, websiteId: website.id }
    })
    if (!permission) {
      return res.status(403).json({ 
        error: 'User has not granted access to this website' 
      })
    }

    // Return only allowed fields
    const response = {}
    if (permission.canSeeName) response.name = user.name
    if (permission.canSeeEmail) response.email = user.email
    if (permission.canSeePhone) response.phone = user.phone
    if (permission.canSeeDob) response.dob = user.dob
    if (permission.canSeeAddress) response.address = user.address

    res.json({ vaultId, data: response })

  } catch (error) {
    console.error('LOOKUP ERROR:', error.message)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router