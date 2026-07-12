import express from 'express'
import { deleteComment, updateComment } from '../controllers/commentController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.route('/:id').put(updateComment).delete(deleteComment)

export default router
