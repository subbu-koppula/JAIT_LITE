import express from 'express';
import { getIssues, createIssue, updateIssue, deleteIssue } from '../controllers/issueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All issue routes require authentication
router.use(protect);

// Routes specific to a project's issues
router.route('/project/:projectId')
  .get(getIssues)
  .post(createIssue);

// Routes for specific issues
router.route('/:id')
  .patch(updateIssue)
  .delete(deleteIssue);

export default router;
