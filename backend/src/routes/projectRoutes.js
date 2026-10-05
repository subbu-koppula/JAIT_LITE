import express from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject,
  deleteProject, 
  addMember,
  removeMember,
  leaveProject
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .patch(updateProject)
  .delete(deleteProject);

router.route('/:id/members')
  .post(addMember);

router.route('/:id/members/:userId')
  .delete(removeMember);

router.route('/:id/leave')
  .post(leaveProject);

export default router;
