import React from 'react';
import { Link } from 'react-router-dom';
import './RequestCard.css';

const RequestCard = ({ request, showOfferBtn, onOffer }) => {
  const urgencyMap = {
    low: { label: 'Low', className: 'badge-info' },
    medium: { label: 'Medium', className: 'badge-warning' },
    high: { label: 'High', className: 'badge-danger' },
    urgent: { label: 'Urgent', className: 'badge-danger' },
  };

  const statusMap = {
    open: { label: 'Open', className: 'badge-success' },
    matched: { label: 'Matched', className: 'badge-info' },
    'in-progress': { label: 'In Progress', className: 'badge-warning' },
    in_progress: { label: 'In Progress', className: 'badge-warning' },
    completed: { label: 'Completed', className: 'badge-primary' },
    closed: { label: 'Closed', className: 'badge-primary' },
    cancelled: { label: 'Cancelled', className: 'badge-danger' },
  };

  const urgency = urgencyMap[request.urgency] || urgencyMap.low;
  const status = statusMap[request.status] || statusMap.open;

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatLocation = (loc) => {
    if (!loc) return '';
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object') {
      return loc.full || [loc.city, loc.state, loc.zipCode].filter(Boolean).join(', ') || '';
    }
    return '';
  };

  const locString = formatLocation(request.location);

  return (
    <article className="request-card">
      <div className="request-card-header">
        <div className="request-card-badges">
          <span className={`badge ${status.className}`}>{status.label}</span>
          <span className={`badge ${urgency.className}`}>{urgency.label}</span>
        </div>
        <span className="request-card-time">{timeAgo(request.createdAt || request.created_at)}</span>
      </div>

      <Link to={`/requests/${request._id || request.id}`} className="request-card-title-link">
        <h3 className="request-card-title">{request.title}</h3>
      </Link>

      <p className="request-card-desc">
        {request.description
          ? request.description.length > 120
            ? request.description.substring(0, 120) + '...'
            : request.description
          : 'No description provided.'}
      </p>

      <div className="request-card-meta">
        {request.clothingType && (
          <span className="request-card-tag">👕 {request.clothingType || request.clothing_type}</span>
        )}
        {(request.repairType || request.repair_type) && (
          <span className="request-card-tag">🪡 {request.repairType || request.repair_type}</span>
        )}
        {locString && (
          <span className="request-card-tag">📍 {locString}</span>
        )}
      </div>

      <div className="request-card-footer">
        <Link to={`/requests/${request._id || request.id}`} className="btn btn-outline btn-sm">
          View Details
        </Link>
        {showOfferBtn && request.status === 'open' && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.preventDefault();
              onOffer && onOffer(request);
            }}
          >
            🤝 Offer to Help
          </button>
        )}
      </div>
    </article>
  );
};

export default RequestCard;
