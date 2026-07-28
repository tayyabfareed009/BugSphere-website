import express from 'express';
import {
  createRequirement,
  createSubmission,
  createTask,
  deleteRequirement,
  deleteTask,
  deleteSubmission,
  getRequirements,
  getSubmissions,
  getTasks,
  reviewSubmission,
  updateRequirement,
  updateTask,
  updateSubmission,
} from '../controllers/workController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.use(protect);

const managers = authorize('Owner', 'Project Manager', 'Team Manager', 'Team Lead');

// --- Requirements ---
router.route('/requirements')
  .get(getRequirements)
  .post(managers, upload.array('files', 5), createRequirement);

router.route('/requirements/:id')
  .put(managers, updateRequirement)
  .delete(managers, deleteRequirement);

// --- Tasks ---
router.route('/tasks')
  .get(getTasks)
  .post(upload.array('files', 5), createTask);

router.route('/tasks/:id')
  .put(updateTask)
  .delete(managers, deleteTask);

// --- Submissions ---
router.route('/submissions')
  .get(getSubmissions)
  .post(upload.array('files', 5), createSubmission);

router.route('/submissions/:id')
  .put(updateSubmission)      // submitter or owner can edit
  .delete(deleteSubmission);  // submitter or owner can delete

router.patch('/submissions/:id/review', reviewSubmission); // manager only

export default router;