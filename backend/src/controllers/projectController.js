import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import User from '../models/User.js';

// @desc    Get all projects (owned or member of)
// @route   GET /api/projects
export const getProjects = async (req, res) => {
  try {
    // Find projects where the user is either the owner OR exists in the members array
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    })
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    const isAuthorized =
      project.owner._id.toString() === req.user.id ||
      project.members.some((member) => member._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(401).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a project name' });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: [], // Starts with no extra members
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a member to a project via email
// @route   POST /api/projects/:id/members
export const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the owner can invite new members
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only the project owner can add members' });
    }

    // Find the user they are trying to invite
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Prevent adding the owner as a member
    if (project.owner.toString() === userToAdd._id.toString()) {
      return res.status(400).json({ message: 'User is already the owner of this project' });
    }

    // Prevent duplicate members
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add user to members array and save
    project.members.push(userToAdd._id);
    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // ONLY the owner can delete the project
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only the owner can delete this project' });
    }

    // Delete all issues related to this project
    await Issue.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ id: req.params.id, message: 'Project and its issues deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
