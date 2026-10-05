import { Trash2 } from 'lucide-react';

const IssueCard = ({ issue, onUpdate, onDelete }) => {
  const priorityColors = {
    LOW: '#3b82f6',    // blue
    MEDIUM: '#f59e0b', // orange
    HIGH: '#ef4444'    // red
  };

  return (
    <div className="issue-card">
      <div className="issue-card-header">
        <h4>{issue.title}</h4>
        <button className="btn-icon text-danger" onClick={() => onDelete(issue._id)} title="Delete Issue">
          <Trash2 size={14} />
        </button>
      </div>
      
      {issue.description && <p className="issue-desc">{issue.description}</p>}
      
      <div className="issue-meta">
        <span 
          className="badge" 
          style={{ backgroundColor: priorityColors[issue.priority], color: 'white' }}
        >
          {issue.priority}
        </span>
        
        <span className="user-name" title="Creator">
          By: {issue.creator?.name || 'Unknown'}
        </span>
      </div>

      <div className="issue-actions">
        <select 
          value={issue.status} 
          onChange={(e) => onUpdate(issue._id, { status: e.target.value })}
          className="status-select"
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
    </div>
  );
};

export default IssueCard;
