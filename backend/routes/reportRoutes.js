import express from 'express'
import { getDashboard, getOwnerDashboard, getReports } from '../controllers/reportController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.get('/dashboard', getDashboard)
router.get('/dashboard/owner', authorize('Owner'), getOwnerDashboard)
router.get('/reports', getReports)

export default router
