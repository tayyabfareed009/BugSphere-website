import express from 'express'
import { createBug, deleteBug, getBug, getBugs, updateBug } from '../controllers/bugController.js'
import { createComment } from '../controllers/commentController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.use(protect)
router.route('/').get(getBugs).post(upload.single('screenshot'), createBug)
router.route('/:id').get(getBug).put(authorize('Admin', 'Developer'), upload.single('screenshot'), updateBug).delete(authorize('Admin'), deleteBug)
router.post('/:bugId/comments', createComment)

export default router
