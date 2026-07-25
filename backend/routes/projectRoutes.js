import express from 'express'
import { createProject, deleteProject, getProject, getProjects, updateProject } from '../controllers/projectController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.route('/').get(getProjects).post(authorize('Owner', 'Project Manager'), createProject)
router.route('/:id').get(getProject).put(authorize('Owner', 'Project Manager'), updateProject).delete(authorize('Owner', 'Project Manager'), deleteProject)

export default router
