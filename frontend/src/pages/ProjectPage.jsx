import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, Users, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import IssueCard from '../components/IssueCard';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ title: '', description: '', priority: 'MEDIUM' });

  useEffect(() => {
    fetchProjectAndIssues();
  }, [id]);

  const fetchProjectAndIssues = async () => {
    try {
      const [projRes, issuesRes] = await Promise.all([
        apiClient.get(`/projects/${id}`),
        apiClient.get(`/issues/project/${id}`)
      ]);
      setProject(projRes.data);
      setIssues(issuesRes.data);
    } catch (error) {
      toast.error('Failed to load project details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // --- Project Actions ---
  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? All issues will be lost.')) return;
    try {
      await apiClient.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post(`/projects/${id}/members`, { email: inviteEmail });
      setProject(res.data);
      toast.success('Member invited successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite member');
    }
  };

  // --- Issue Actions ---
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post(`/issues/project/${id}`, issueForm);
      setIssues([...issues, res.data]); // Add to UI
      toast.success('Issue created!');
      setIsIssueModalOpen(false);
      setIssueForm({ title: '', description: '', priority: 'MEDIUM' });
    } catch (error) {
      toast.error('Failed to create issue');
    }
  };

  const handleUpdateIssue = async (issueId, updateData) => {
    try {
      const res = await apiClient.patch(`/issues/${issueId}`, updateData);
      // Update the issue in our local state
      setIssues(issues.map(issue => issue._id === issueId ? res.data : issue));
      toast.success('Issue updated');
    } catch (error) {
      toast.error('Failed to update issue');
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Delete this issue?')) return;
    try {
      await apiClient.delete(`/issues/${issueId}`);
      setIssues(issues.filter(issue => issue._id !== issueId));
      toast.success('Issue deleted');
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  if (loading) return <div>Loading project...</div>;
  if (!project) return <div>Project not found</div>;

  const isOwner = project.owner._id === user._id;

  return (
    <div>
      <div className="project-header">
        <div className="project-title-area">
          <Link to="/" className="btn-back"><ArrowLeft size={20} /></Link>
          <div>
            <h1>{project.name}</h1>
            <p className="text-muted">{project.description}</p>
          </div>
        </div>
        
        <div className="project-actions">
          <button className="btn btn-primary" onClick={() => setIsIssueModalOpen(true)}>
            <Plus size={16} /> New Issue
          </button>
          {isOwner && (
            <>
              <button className="btn btn-outline" onClick={() => setIsInviteModalOpen(true)}>
                <Users size={16} /> Invite
              </button>
              <button className="btn btn-danger" onClick={handleDeleteProject}>
                <Trash2 size={16} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Kanban Issue Board */}
      <div className="kanban-board">
        {STATUSES.map(status => (
          <div key={status} className="kanban-column">
            <h3 className="kanban-column-title">
              {status.replace('_', ' ')} 
              <span className="count-badge">{issues.filter(i => i.status === status).length}</span>
            </h3>
            <div className="kanban-issues">
              {issues
                .filter(issue => issue.status === status)
                .map(issue => (
                  <IssueCard 
                    key={issue._id} 
                    issue={issue} 
                    onUpdate={handleUpdateIssue}
                    onDelete={handleDeleteIssue}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite a Member">
        <form onSubmit={handleInviteMember}>
          <div className="form-group">
            <label>User's Email</label>
            <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Send Invite</button>
        </form>
      </Modal>

      {/* Create Issue Modal */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Create New Issue">
        <form onSubmit={handleCreateIssue}>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" required 
              value={issueForm.title} 
              onChange={(e) => setIssueForm({...issueForm, title: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              rows="3" 
              value={issueForm.description} 
              onChange={(e) => setIssueForm({...issueForm, description: e.target.value})} 
              style={{ width: '100%', padding: '0.75rem', borderColor: 'var(--border-color)', borderRadius: '4px' }}
            />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select 
              value={issueForm.priority} 
              onChange={(e) => setIssueForm({...issueForm, priority: e.target.value})}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Create Issue</button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectPage;
