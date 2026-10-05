import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Trash2, Edit2, Save, X } from 'lucide-react';

const IssueDetailModal = ({ 
  isOpen, 
  onClose, 
  issue, 
  projectMembers, 
  projectRole, 
  currentUser,
  onUpdate, 
  onDelete 
}) => {
  if (!isOpen || !issue) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    status: '',
    assignee: ''
  });

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title,
        description: issue.description || '',
        priority: issue.priority,
        status: issue.status,
        assignee: issue.assignee ? issue.assignee._id : ''
      });
      setIsEditing(false);
    }
  }, [issue]);

  // RBAC Checks
  const isAdmin = projectRole === 'admin' || projectRole === 'owner';
  const isCreator = issue.creator?._id === currentUser._id;
  const isAssignee = issue.assignee?._id === currentUser._id;
  
  const canEditDetails = isAdmin || isCreator || isAssignee;
  const canDelete = isAdmin;
  const canChangeAssignee = isAdmin;
  
  // Status check: admin, or member if unassigned, or assignee
  const isUnassigned = !issue.assignee;
  const canChangeStatus = isAdmin || (isUnassigned && projectRole === 'member') || isAssignee;

  const handleSave = () => {
    onUpdate(issue._id, formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(issue._id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Issue' : issue.title}>
      
      {!isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Description</span>
            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
              {issue.description || <span style={{ fontStyle: 'italic', color: 'var(--muted-foreground)' }}>No description provided.</span>}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Status</span>
              <div style={{ marginTop: '0.25rem', fontWeight: '500' }}>{issue.status.replace('_', ' ')}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Priority</span>
              <div style={{ marginTop: '0.25rem', fontWeight: '500' }}>{issue.priority}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Author</span>
              <div style={{ marginTop: '0.25rem' }}>{issue.creator?.name}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Assignee</span>
              <div style={{ marginTop: '0.25rem' }}>{issue.assignee?.name || 'Unassigned'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {canEditDetails && (
                <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} /> Edit
                </button>
              )}
              {canChangeStatus && !canEditDetails && (
                <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                  Change Status
                </button>
              )}
            </div>
            {canDelete && (
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>
      ) : (
        // EDIT MODE
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {canEditDetails && (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Description</label>
                <textarea 
                  rows="4"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Priority</label>
                <select 
                  value={formData.priority} 
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </>
          )}

          {canChangeStatus && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          )}

          {canChangeAssignee && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Assignee</label>
              <select 
                value={formData.assignee} 
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
              >
                <option value="">Unassigned</option>
                {/* Ensure owner is listed as an option */}
                <option value={projectMembers.owner?._id}>{projectMembers.owner?.name} (Owner)</option>
                {projectMembers.list?.map(m => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-ghost" onClick={() => {
              // Reset
              setFormData({
                title: issue.title,
                description: issue.description || '',
                priority: issue.priority,
                status: issue.status,
                assignee: issue.assignee ? issue.assignee._id : ''
              });
              setIsEditing(false);
            }}>
              <X size={16} /> Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default IssueDetailModal;
