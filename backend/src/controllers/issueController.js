import Issue from '../models/Issue.js';
import Project from '../models/Project.js';

// Helper function to check if user has access to a project
const checkAccess = (project, userId) => {
  return (
    project.owner.toString() === userId || 
    project.members.some((member) => member.toString() === userId)
  );
};

// @desc    Get all issues for a specific project
// @route   GET /api/issues/project/:projectId
export const getIssues = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Verify user is owner or member
    if (!checkAccess(project, req.user.id)) {
      return res.status(401).json({ message: 'Not authorized to view these issues' });
    }

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

    // Verify user is owner or member
    if (!checkAccess(project, req.user.id)) {
      return res.status(401).json({ message: 'Not authorized to create issues in this project' });
    }

    // Optional: If an assignee is provided, ensure they are part of the project
    if (assignee && !checkAccess(project, assignee)) {
      return res.status(400).json({ message: 'Assignee must be a project member or owner' });
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

// @desc    Update an issue (status, priority, assignee, etc)
// @route   PATCH /api/issues/:id
export const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const project = await Project.findById(issue.project);

    // Verify user is owner or member
    if (!checkAccess(project, req.user.id)) {
      return res.status(401).json({ message: 'Not authorized to update this issue' });
    }

    // Optional: If updating the assignee, ensure they belong to the project
    if (req.body.assignee && !checkAccess(project, req.body.assignee)) {
      return res.status(400).json({ message: 'Assignee must be a project member or owner' });
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

    // Verify user is owner or member
    if (!checkAccess(project, req.user.id)) {
      return res.status(401).json({ message: 'Not authorized to delete this issue' });
    }

    await issue.deleteOne();
    res.json({ id: req.params.id, message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
