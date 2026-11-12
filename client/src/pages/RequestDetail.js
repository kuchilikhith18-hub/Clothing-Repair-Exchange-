import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRequestById, deleteRequest, createMatch, acceptMatch, rejectMatch } from '../services/api';
import Alert from '../components/Alert';
import MatchCard from '../components/MatchCard';
import './RequestDetail.css';

const RequestDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [matchForm, setMatchForm] = useState({ message: '', scheduledDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequest();
    // eslint-disable-next-line
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await getRequestById(id);
      setRequest(res.data.data || res.data.request || res.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Request not found or an error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await deleteRequest(id);
      setAlert({ type: 'success', message: 'Request deleted.' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete.' });
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createMatch({
        repairRequestId: id,
        requestId: id,
        request: id,
        message: matchForm.message.trim(),
        scheduledDate: matchForm.scheduledDate ? matchForm.scheduledDate : undefined,
      });
      setAlert({ type: 'success', message: 'Your offer has been sent! 🎉' });
      setShowModal(false);
      setMatchForm({ message: '', scheduledDate: '' });
      fetchRequest();
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors?.map((e) => e.message).join(', ') ||
        err.response?.data?.message ||
        'Failed to send offer.';
      setAlert({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptMatch = async (matchId) => {
    try {
      await acceptMatch(matchId);
      setAlert({ type: 'success', message: 'Match accepted!' });
      fetchRequest();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to accept match.' });
    }
  };

  const handleRejectMatch = async (matchId) => {
    try {
      await rejectMatch(matchId);
      setAlert({ type: 'success', message: 'Match rejected.' });
      fetchRequest();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to reject match.' });
    }
  };

  const urgencyMap = {
    low: { label: 'Low', className: 'badge-info', icon: '🟢' },
    medium: { label: 'Medium', className: 'badge-warning', icon: '🟡' },
    high: { label: 'High', className: 'badge-danger', icon: '🟠' },
    urgent: { label: 'Urgent', className: 'badge-danger', icon: '🔴' },
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

  if (loading) {
    return (
      <main className="page">
        <div className="spinner-container"><div className="spinner"></div></div>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="page">
        <div className="container">
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p>Request not found.</p>
          </div>
        </div>
      </main>
    );
  }

  const isOwner = user && (
    (request.user?._id || request.user?.id || request.user) === (user._id || user.id)
  );
  const urgency = urgencyMap[request.urgency] || urgencyMap.low;
  const status = statusMap[request.status] || statusMap.open;
  const matches = request.matches || [];

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
    <main className="request-detail-page page">
      <div className="container">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="detail-layout">
          <article className="detail-main">
            <div className="detail-badges">
              <span className={`badge ${status.className}`}>{status.label}</span>
              <span className={`badge ${urgency.className}`}>{urgency.icon} {urgency.label}</span>
            </div>

            <h1 className="detail-title">{request.title}</h1>

            <div className="detail-meta">
              {(request.clothingType || request.clothing_type) && (
                <span className="detail-meta-item">👕 {request.clothingType || request.clothing_type}</span>
              )}
              {(request.repairType || request.repair_type) && (
                <span className="detail-meta-item">🪡 {request.repairType || request.repair_type}</span>
              )}
              {locString && (
                <span className="detail-meta-item">📍 {locString}</span>
              )}
              <span className="detail-meta-item">
                📅 {new Date(request.createdAt || request.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="detail-description">
              <h2>Description</h2>
              <p>{request.description}</p>
            </div>

            {/* Map Placeholder */}
            {locString && (
              <div className="detail-map-placeholder">
                <span className="map-icon">🗺️</span>
                <p>Location: {locString}</p>
                <span className="map-hint">Map integration coming soon</span>
              </div>
            )}

            {/* Posted By */}
            {request.user && typeof request.user === 'object' && (
              <div className="detail-posted-by">
                <div className="detail-poster-avatar">
                  {(request.user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="detail-poster-label">Posted by</span>
                  <span className="detail-poster-name">{request.user.name || 'Anonymous'}</span>
                </div>
              </div>
            )}
          </article>

          <aside className="detail-sidebar">
            {/* Actions */}
            <div className="detail-actions-card">
              <h3>Actions</h3>
              {isAuthenticated && !isOwner && request.status === 'open' && (
                <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
                  🤝 Offer to Help
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate(`/requests/${id}/edit`)}
                  >
                    ✏️ Edit Request
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    🗑️ Delete Request
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <p className="detail-login-hint">
                  <a href="/login">Login</a> to offer help or manage this request.
                </p>
              )}
            </div>

            {/* Matches (for owner) */}
            {isOwner && matches.length > 0 && (
              <div className="detail-matches-card">
                <h3>Match Offers ({matches.length})</h3>
                <div className="detail-matches-list">
                  {matches.map((match) => (
                    <MatchCard
                      key={match._id || match.id}
                      match={match}
                      perspective="requester"
                      onAccept={handleAcceptMatch}
                      onReject={handleRejectMatch}
                    />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Offer Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🤝 Offer to Help</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleOfferSubmit}>
                <div className="form-group">
                  <label htmlFor="matchMessage">Message</label>
                  <textarea
                    id="matchMessage"
                    className="form-control"
                    placeholder="Introduce yourself and explain how you can help..."
                    rows="4"
                    value={matchForm.message}
                    onChange={(e) => setMatchForm({ ...matchForm, message: e.target.value })}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="scheduledDate">Preferred Date</label>
                  <input
                    type="date"
                    id="scheduledDate"
                    className="form-control"
                    value={matchForm.scheduledDate}
                    onChange={(e) => setMatchForm({ ...matchForm, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                      <><span className="spinner spinner-sm"></span> Sending...</>
                    ) : (
                      'Send Offer'
                    )}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default RequestDetail;
