import express from 'express'
import { getDashboard, getReports } from '../controllers/reportController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.get('/dashboard', getDashboard)
router.get('/reports', getReports)

export default router
