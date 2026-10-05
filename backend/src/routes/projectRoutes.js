import express from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  deleteProject, 
  addMember 
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All project routes require authentication
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .delete(deleteProject);

// Route for inviting a member
router.post('/:id/members', addMember);

export default router;
