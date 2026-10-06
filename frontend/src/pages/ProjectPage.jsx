import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Settings, Users, Plus, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import IssueCard from '../components/IssueCard';
import IssueDetailModal from '../components/IssueDetailModal';

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
  const [inviteRole, setInviteRole] = useState('member');
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ title: '', description: '', priority: 'MEDIUM', assignee: '' });

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
      setProjectForm({ name: projRes.data.name, description: projRes.data.description || '' });
      setIssues(issuesRes.data);
    } catch (error) {
      toast.error('Failed to load project details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // --- Project / RBAC helpers ---
  const role = project?.currentUserRole;
  const isAdmin = role === 'admin' || role === 'owner';
  const isOwner = role === 'owner';

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.patch(`/projects/${id}`, projectForm);
      setProject({ ...project, name: res.data.name, description: res.data.description });
      toast.success('Project updated');
      setIsSettingsModalOpen(false);
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await apiClient.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleLeaveProject = async () => {
    if (!window.confirm('Are you sure you want to leave this project?')) return;
    try {
      await apiClient.post(`/projects/${id}/leave`);
      toast.success('You left the project');
      navigate('/');
    } catch (error) {
      toast.error('Failed to leave project');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post(`/projects/${id}/members`, { email: inviteEmail, role: inviteRole });
      setProject({ ...res.data, currentUserRole: project.currentUserRole });
      toast.success('Member added!');
      setInviteEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await apiClient.delete(`/projects/${id}/members/${userId}`);
      setProject({ ...res.data, currentUserRole: project.currentUserRole });
      toast.success('Member removed');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  // --- Issue Actions ---
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post(`/issues/project/${id}`, issueForm);
      setIssues([...issues, res.data]);
      toast.success('Issue created!');
      setIsIssueModalOpen(false);
      setIssueForm({ title: '', description: '', priority: 'MEDIUM', assignee: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create issue');
    }
  };

  const handleUpdateIssue = async (issueId, updateData) => {
    try {
      const res = await apiClient.patch(`/issues/${issueId}`, updateData);
      setIssues(issues.map(issue => issue._id === issueId ? res.data : issue));
      
      // Update selected issue if it's currently open
      if (selectedIssue && selectedIssue._id === issueId) {
        setSelectedIssue(res.data);
      }
      toast.success('Issue updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update issue');
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Delete this issue?')) return;
    try {
      await apiClient.delete(`/issues/${issueId}`);
      setIssues(issues.filter(issue => issue._id !== issueId));
      setIsDetailModalOpen(false);
      toast.success('Issue deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete issue');
    }
  };

  const openIssueDetail = (issue) => {
    setSelectedIssue(issue);
    setIsDetailModalOpen(true);
  };

  if (loading) return <div className="loading-state">Loading project...</div>;
  if (!project) return <div>Project not found</div>;

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
          {role !== 'observer' && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsIssueModalOpen(true)}>
              <Plus size={16} /> New Issue
            </button>
          )}
          
          {isAdmin && (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => setIsInviteModalOpen(true)}>
                <Users size={16} /> Team
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setIsSettingsModalOpen(true)}>
                <Settings size={16} /> Settings
              </button>
            </>
          )}

          {!isOwner && (
            <button className="btn btn-outline btn-sm" onClick={handleLeaveProject}>
              <LogOut size={16} /> Leave
            </button>
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
                .map(issue => {
                  const isUnassigned = !issue.assignee;
                  const isAssignee = issue.assignee?._id === user._id;
                  const canChangeStatus = isAdmin || (isUnassigned && role === 'member') || isAssignee;

                  return (
                    <IssueCard 
                      key={issue._id} 
                      issue={issue} 
                      onClick={openIssueDetail}
                      onStatusChange={(id, newStatus) => handleUpdateIssue(id, { status: newStatus })}
                      canChangeStatus={canChangeStatus}
                    />
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Team Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Manage Team">
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Current Members</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--background)', borderRadius: '4px' }}>
              <span>{project.owner.name} <span className="text-muted">({project.owner.email})</span></span>
              <span className="badge">Owner</span>
            </div>
            {project.members.map(m => (
              <div key={m.user._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--background)', borderRadius: '4px' }}>
                <span>{m.user.name} <span className="text-muted">({m.user.email})</span></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="badge">{m.role}</span>
                  {isAdmin && (
                    <button className="btn-icon text-danger" onClick={() => handleRemoveMember(m.user._id)}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Add Member</h4>
        <form onSubmit={handleInviteMember} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Email</label>
            <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </div>
          <div className="form-group" style={{ width: '120px', marginBottom: 0 }}>
            <label>Role</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="observer">Observer</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Add</button>
        </form>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Project Settings">
        <form onSubmit={handleUpdateProject}>
          <div className="form-group">
            <label>Project Name</label>
            <input type="text" required value={projectForm.name} onChange={(e) => setProjectForm({...projectForm, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows="3" value={projectForm.description} onChange={(e) => setProjectForm({...projectForm, description: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
            {isOwner && (
              <button type="button" className="btn btn-danger" onClick={handleDeleteProject}>
                Delete Project
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* Create Issue Modal */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Create New Issue">
        <form onSubmit={handleCreateIssue}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" required value={issueForm.title} onChange={(e) => setIssueForm({...issueForm, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows="3" value={issueForm.description} onChange={(e) => setIssueForm({...issueForm, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={issueForm.priority} onChange={(e) => setIssueForm({...issueForm, priority: e.target.value})}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          {isAdmin && (
            <div className="form-group">
              <label>Assignee</label>
              <select value={issueForm.assignee} onChange={(e) => setIssueForm({...issueForm, assignee: e.target.value})}>
                <option value="">Unassigned</option>
                <option value={project.owner._id}>{project.owner.name} (Owner)</option>
                {project.members.map(m => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary">Create Issue</button>
        </form>
      </Modal>

      {/* Issue Detail Modal (Handles view & edit for existing issues) */}
      <IssueDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        issue={selectedIssue}
        projectRole={role}
        currentUser={user}
        projectMembers={{ owner: project.owner, list: project.members }}
        onUpdate={handleUpdateIssue}
        onDelete={handleDeleteIssue}
      />
    </div>
  );
};

export default ProjectPage;
