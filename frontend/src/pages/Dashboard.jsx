import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get('/projects');
      setProjects(res.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/projects', { name, description });
      // Add new project to the UI instantly
      setProjects([...projects, res.data]);
      toast.success('Project created!');
      setIsModalOpen(false);
      setName('');
      setDescription('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Your Projects</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any projects yet.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <Link to={`/projects/${project._id}`} key={project._id} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description || 'No description provided.'}</p>
              <div className="project-card-footer">
                <span className="badge">
                  {project.members.length + 1} Member(s)
                </span>
                <span className="date">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label>Project Name</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., E-commerce Redesign"
            />
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea 
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              style={{ width: '100%', padding: '0.75rem', borderColor: 'var(--border-color)', borderRadius: '4px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
