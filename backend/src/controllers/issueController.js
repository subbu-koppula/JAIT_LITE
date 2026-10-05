import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import { getUserRole, isAdmin } from './projectController.js';

// @desc    Get all issues for a specific project
// @route   GET /api/issues/project/:projectId
export const getIssues = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const role = getUserRole(project, req.user.id);
    if (!role) return res.status(401).json({ message: 'Not authorized' });

    const issues = await Issue.find({ project: projectId })
      .populate('creator', 'name email')
      .populate('assignee', 'name email');
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new issue
// @route   POST /api/issues/project/:projectId
export const createIssue = async (req, res) => {
  try {
    const { title, description, priority, status, assignee } = req.body;
    const { projectId } = req.params;

    if (!title) return res.status(400).json({ message: 'Please provide an issue title' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const role = getUserRole(project, req.user.id);
    if (!role || role === 'observer') {
      return res.status(401).json({ message: 'Observers cannot create issues' });
    }

    // Only admins can assign issues to others during creation
    if (assignee && !isAdmin(role)) {
      return res.status(401).json({ message: 'Only admins can assign issues' });
    }
    
    if (assignee && !getUserRole(project, assignee)) {
      return res.status(400).json({ message: 'Assignee is not in this project' });
    }

    const issue = await Issue.create({
      title,
      description,
      priority: priority || 'MEDIUM',
      status: status || 'OPEN',
      project: projectId,
      creator: req.user.id,
      assignee: assignee || null,
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('creator', 'name email')
      .populate('assignee', 'name email');

    res.status(201).json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update an issue
// @route   PATCH /api/issues/:id
export const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const project = await Project.findById(issue.project);
    const role = getUserRole(project, req.user.id);
    if (!role || role === 'observer') {
      return res.status(401).json({ message: 'Observers cannot edit issues' });
    }

    const { title, description, priority, status, assignee } = req.body;

    // Editing title/desc/priority: Admin, Creator, or Assignee
    const isCreator = issue.creator.toString() === req.user.id;
    const isAssignee = issue.assignee && issue.assignee.toString() === req.user.id;
    const canEditDetails = isAdmin(role) || isCreator || isAssignee;

    if ((title !== undefined || description !== undefined || priority !== undefined) && !canEditDetails) {
      return res.status(401).json({ message: 'Not authorized to edit issue details' });
    }

    // Assigning: Only admin
    if (assignee !== undefined) {
      const currentAssignee = issue.assignee ? issue.assignee.toString() : '';
      const newAssignee = assignee === null ? '' : assignee;
      
      // If a non-admin tries to CHANGE the assignee, block it.
      if (currentAssignee !== newAssignee && !isAdmin(role)) {
        return res.status(401).json({ message: 'Only admins can change assignee' });
      }
      
      if (newAssignee && !getUserRole(project, newAssignee)) {
        return res.status(400).json({ message: 'Assignee is not in this project' });
      }
    }

    // Changing status
    if (status !== undefined) {
      const isUnassigned = !issue.assignee;
      const canChangeStatus = 
        isAdmin(role) || 
        (isUnassigned && role === 'member') || 
        (isAssignee);
        
      if (!canChangeStatus) {
        return res.status(401).json({ message: 'Not authorized to change status' });
      }
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('creator', 'name email')
      .populate('assignee', 'name email');

    res.json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete an issue
// @route   DELETE /api/issues/:id
export const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const project = await Project.findById(issue.project);
    const role = getUserRole(project, req.user.id);

    if (!isAdmin(role)) {
      return res.status(401).json({ message: 'Only admins can delete issues' });
    }

    await issue.deleteOne();
    res.json({ id: req.params.id, message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
