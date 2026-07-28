import express from 'express'
import { createRequirement, createSubmission, createTask, deleteRequirement, deleteTask, getRequirements, getSubmissions, getTasks, reviewSubmission, updateRequirement, updateTask } from '../controllers/workController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'
const router = express.Router(); router.use(protect)
const managers = authorize('Owner', 'Project Manager', 'Team Manager', 'Team Lead')
router.route('/requirements').get(getRequirements).post(managers, upload.array('files', 5), createRequirement)
router.route('/requirements/:id').put(managers, updateRequirement).delete(managers, deleteRequirement)
router.route('/tasks').get(getTasks).post(upload.array('files', 5), createTask)
router.route('/tasks/:id').put(updateTask).delete(managers, deleteTask)
router.route('/submissions').get(getSubmissions).post(upload.array('files', 5), createSubmission)
router.patch('/submissions/:id/review', reviewSubmission)
export default router
