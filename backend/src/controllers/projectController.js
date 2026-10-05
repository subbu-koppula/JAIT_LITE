import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import User from '../models/User.js';

// Helper to get a user's role in a project
// Returns 'owner', 'admin', 'member', 'observer', or null
export const getUserRole = (project, userId) => {
  if (project.owner._id ? project.owner._id.toString() === userId : project.owner.toString() === userId) {
    return 'owner'; // implicit admin
  }
  const memberRecord = project.members.find(m => 
    (m.user._id ? m.user._id.toString() : m.user.toString()) === userId
  );
  return memberRecord ? memberRecord.role : null;
};

export const isAdmin = (role) => ['owner', 'admin'].includes(role);

// @desc    Get all projects
// @route   GET /api/projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { 'members.user': req.user.id }],
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
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
      .populate('members.user', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const role = getUserRole(project, req.user.id);
    if (!role) return res.status(401).json({ message: 'Not authorized to view this project' });

    // Send project data + the user's role for easy frontend access
    res.json({ ...project.toObject(), currentUserRole: role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Please provide a project name' });

    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: [],
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update project (Title, Description)
// @route   PATCH /api/projects/:id
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const role = getUserRole(project, req.user.id);
    if (!isAdmin(role)) {
      return res.status(401).json({ message: 'Only admins can update project details' });
    }

    const { name, description } = req.body;
    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;
    
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a member to a project via email
// @route   POST /api/projects/:id/members
export const addMember = async (req, res) => {
  try {
    const { email, role } = req.body; // role can be 'admin', 'member', 'observer'
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const currentUserRole = getUserRole(project, req.user.id);
    if (!isAdmin(currentUserRole)) {
      return res.status(401).json({ message: 'Only admins can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    if (project.owner.toString() === userToAdd._id.toString()) {
      return res.status(400).json({ message: 'User is the owner' });
    }

    const existingMember = project.members.find(m => m.user.toString() === userToAdd._id.toString());
    if (existingMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({
      user: userToAdd._id,
      role: role || 'member'
    });
    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove a member from a project
// @route   DELETE /api/projects/:id/members/:userId
export const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const currentUserRole = getUserRole(project, req.user.id);
    if (!isAdmin(currentUserRole)) {
      return res.status(401).json({ message: 'Only admins can remove members' });
    }

    // Filter out the user
    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Leave a project
// @route   POST /api/projects/:id/leave
export const leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'Owner cannot leave. Delete project instead.' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.user.id);
    await project.save();

    res.json({ message: 'Successfully left project' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only the owner can delete this project' });
    }

    await Issue.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ id: req.params.id, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
