import Issue from '../models/Issue.js';
import Project from '../models/Project.js';

// @desc    Get all issues for a specific project
// @route   GET /api/issues/project/:projectId
export const getIssues = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and belongs to the user
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to view these issues' });
    }

    // Find issues, and 'populate' the creator and assignee fields to get their names and emails
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
    const { title, description, priority, status } = req.body;
    const { projectId } = req.params;

    if (!title) {
      return res.status(400).json({ message: 'Please provide an issue title' });
    }

    // Verify project exists and the user has access
    const project = await Project.findById(projectId);
    if (!project || project.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to create issues in this project' });
    }

    const issue = await Issue.create({
      title,
      description,
      priority: priority || 'MEDIUM',
      status: status || 'OPEN',
      project: projectId,
      creator: req.user.id,
    });

    // Populate creator details before returning
    const populatedIssue = await Issue.findById(issue._id).populate('creator', 'name email');
    res.status(201).json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update an issue (status, priority, etc)
// @route   PATCH /api/issues/:id
export const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Verify the user owns the project this issue belongs to
    const project = await Project.findById(issue.project);
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this issue' });
    }

    // Update the issue
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Returns the newly updated document instead of the old one
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

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Verify ownership
    const project = await Project.findById(issue.project);
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this issue' });
    }

    await issue.deleteOne();
    res.json({ id: req.params.id, message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
