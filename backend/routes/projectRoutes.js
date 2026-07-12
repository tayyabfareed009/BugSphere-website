import express from 'express'
import { createProject, deleteProject, getProject, getProjects, updateProject } from '../controllers/projectController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.route('/').get(getProjects).post(authorize('Admin'), createProject)
router.route('/:id').get(getProject).put(authorize('Admin'), updateProject).delete(authorize('Admin'), deleteProject)

export default router
