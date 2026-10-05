const IssueCard = ({ issue, onClick, onStatusChange, canChangeStatus }) => {
  const priorityColors = {
    LOW: '#3b82f6',    // blue
    MEDIUM: '#f59e0b', // orange
    HIGH: '#ef4444'    // red
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="issue-card" onClick={() => onClick(issue)}>
      <div className="issue-card-title">{issue.title}</div>
      <div className="issue-meta" style={{ marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span 
            className="badge" 
            style={{ backgroundColor: priorityColors[issue.priority], color: 'white' }}
          >
            {issue.priority}
          </span>

          {canChangeStatus && (
            <select
              className="card-status-select"
              value={issue.status}
              onClick={(e) => e.stopPropagation()} // Prevent opening modal
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(issue._id, e.target.value);
              }}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Prog</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <div className="avatar-circle" title={`Author: ${issue.creator?.name}`}>
            {getInitials(issue.creator?.name)}
          </div>
          {issue.assignee && (
            <div className="avatar-circle" style={{ background: '#3b82f6' }} title={`Assignee: ${issue.assignee.name}`}>
              {getInitials(issue.assignee.name)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
