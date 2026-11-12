import React from 'react';
import './MatchCard.css';

const MatchCard = ({ match, perspective, onAccept, onReject, onComplete }) => {
  const statusMap = {
    pending: { label: 'Pending', className: 'badge-warning' },
    accepted: { label: 'Accepted', className: 'badge-success' },
    rejected: { label: 'Rejected', className: 'badge-danger' },
    completed: { label: 'Completed', className: 'badge-primary' },
    cancelled: { label: 'Cancelled', className: 'badge-danger' },
  };

  const status = statusMap[match.status] || statusMap.pending;

  const otherParty = perspective === 'requester'
    ? match.volunteer || match.volunteerId
    : match.requester || match.requesterId;

  const otherName = typeof otherParty === 'object'
    ? otherParty?.name || 'Unknown'
    : 'Unknown';

  const requestTitle = typeof match.request === 'object'
    ? match.request?.title
    : typeof match.requestId === 'object'
      ? match.requestId?.title
      : match.requestTitle || 'Repair Request';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not scheduled';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <article className="match-card">
      <div className="match-card-header">
        <span className={`badge ${status.className}`}>{status.label}</span>
        <span className="match-card-date">
          📅 {formatDate(match.scheduledDate || match.scheduled_date || match.createdAt)}
        </span>
      </div>

      <h3 className="match-card-title">{requestTitle}</h3>

      <div className="match-card-party">
        <div className="match-card-party-avatar">
          {otherName.charAt(0).toUpperCase()}
        </div>
        <div>
          <span className="match-card-party-label">
            {perspective === 'requester' ? 'Volunteer' : 'Requester'}
          </span>
          <span className="match-card-party-name">{otherName}</span>
        </div>
      </div>

      {match.message && (
        <div className="match-card-message">
          <span className="match-card-msg-label">💬 Message:</span>
          <p>{match.message}</p>
        </div>
      )}

      <div className="match-card-actions">
        {perspective === 'requester' && match.status === 'pending' && (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => onAccept && onAccept(match._id || match.id)}>
              ✅ Accept
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onReject && onReject(match._id || match.id)}>
              ❌ Reject
            </button>
          </>
        )}
        {match.status === 'accepted' && (
          <button className="btn btn-secondary btn-sm" onClick={() => onComplete && onComplete(match._id || match.id)}>
            🎉 Mark Complete
          </button>
        )}
      </div>
    </article>
  );
};

export default MatchCard;
