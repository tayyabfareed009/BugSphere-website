import express from 'express'
import { createTeam, deleteTeam, getTeams, updateTeam } from '../controllers/teamController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'
const router = express.Router(); router.use(protect)
router.route('/').get(getTeams).post(authorize('Owner'), createTeam)
router.route('/:id').put(authorize('Owner'), updateTeam).delete(authorize('Owner'), deleteTeam)
export default router
