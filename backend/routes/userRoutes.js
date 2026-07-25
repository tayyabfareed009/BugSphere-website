import express from 'express'
import { deleteUser, getUsers, updateProfile, updateUser } from '../controllers/userController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.get('/', authorize('Owner', 'Project Manager', 'Team Lead'), getUsers)
router.put('/profile', updateProfile)
router.route('/:id').put(authorize('Owner'), updateUser).delete(authorize('Owner'), deleteUser)

export default router
