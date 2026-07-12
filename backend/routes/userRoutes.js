import express from 'express'
import { deleteUser, getUsers, updateProfile, updateUser } from '../controllers/userController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.get('/', authorize('Admin'), getUsers)
router.put('/profile', updateProfile)
router.route('/:id').put(authorize('Admin'), updateUser).delete(authorize('Admin'), deleteUser)

export default router
