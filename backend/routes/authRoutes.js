import express from 'express'
import { firebaseSession, logout, me } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/session', firebaseSession)
router.post('/logout', logout)
router.get('/me', protect, me)

export default router
