import Project from '../models/Project.js';
import Issue from '../models/Issue.js';

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
export const getProjects = async (req, res) => {
  try {
    // Only find projects where the owner matches the logged-in user's ID
    const projects = await Project.find({ owner: req.user.id });
    res.json(projects);
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
      owner: req.user.id, // Attach the user ID from the auth token
    });

    res.status(201).json(project);
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

    // Ensure the user deleting the project is the actual owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this project' });
    }

    // We must also delete all issues related to this project!
    await Issue.deleteMany({ project: req.params.id });

    // Then delete the project itself
    await project.deleteOne();

    res.json({ id: req.params.id, message: 'Project and its issues deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
