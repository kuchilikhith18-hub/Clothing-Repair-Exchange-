import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRequests, createMatch } from '../services/api';
import RequestCard from '../components/RequestCard';
import Alert from '../components/Alert';
import './BrowseRequests.css';

const CLOTHING_TYPES = [
  'T-Shirt', 'Shirt', 'Pants', 'Jeans', 'Dress', 'Skirt', 'Jacket',
  'Coat', 'Sweater', 'Hoodie', 'Suit', 'Blouse', 'Shorts', 'Other',
];

const REPAIR_TYPES = [
  'Sewing', 'Patching', 'Zipper Repair', 'Button Replacement',
  'Hemming', 'Darning', 'Alterations', 'Embroidery', 'Tear Repair', 'Other',
];

const BrowseRequests = () => {
  const { isAuthenticated, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    clothingType: '',
    repairType: '',
    urgency: '',
    location: '',
    status: 'open',
  });

  // Offer modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [matchForm, setMatchForm] = useState({ message: '', scheduledDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });
      const res = await getRequests(params);
      const data = res.data.data || res.data.requests || res.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setRequests([]);
      setAlert({ type: 'error', message: 'Failed to load requests.' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ clothingType: '', repairType: '', urgency: '', location: '', status: 'open' });
  };

  const handleOffer = (request) => {
    setSelectedRequest(request);
    setMatchForm({ message: '', scheduledDate: '' });
    setShowModal(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      const targetId = selectedRequest._id || selectedRequest.id;
      await createMatch({
        repairRequestId: targetId,
        requestId: targetId,
        request: targetId,
        message: matchForm.message.trim(),
        scheduledDate: matchForm.scheduledDate ? matchForm.scheduledDate : undefined,
      });
      setAlert({ type: 'success', message: 'Your offer has been sent! 🎉' });
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors?.map((e) => e.message).join(', ') ||
        err.response?.data?.message ||
        'Failed to send offer.';
      setAlert({ type: 'error', message: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const isVolunteer = user && (user.role === 'volunteer' || user.role === 'both');

  return (
    <main className="browse-page page">
      <div className="container">
        <div className="browse-header">
          <div>
            <h1>🔍 Browse Repair Requests</h1>
            <p>Find clothing items that need your repair skills</p>
          </div>
          <button
            className="btn btn-outline filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            🔧 {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Filters */}
        <div className={`browse-filters ${showFilters ? 'open' : ''}`}>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Clothing Type</label>
              <select name="clothingType" className="form-control" value={filters.clothingType} onChange={handleFilterChange}>
                <option value="">All Types</option>
                {CLOTHING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Repair Type</label>
              <select name="repairType" className="form-control" value={filters.repairType} onChange={handleFilterChange}>
                <option value="">All Repairs</option>
                {REPAIR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Urgency</label>
              <select name="urgency" className="form-control" value={filters.urgency} onChange={handleFilterChange}>
                <option value="">Any Urgency</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="Filter by location..."
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <button className="btn btn-sm btn-outline clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        {/* Results */}
        <div className="browse-results-header">
          <span className="browse-count">
            {loading ? 'Loading...' : `${requests.length} request${requests.length !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : requests.length > 0 ? (
          <div className="browse-grid">
            {requests.map((req) => (
              <RequestCard
                key={req._id || req.id}
                request={req}
                showOfferBtn={isAuthenticated && isVolunteer}
                onOffer={handleOffer}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No requests match your filters.</p>
            <button className="btn btn-outline btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {/* Offer Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🤝 Offer to Help</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <p className="modal-request-title">
                For: <strong>{selectedRequest?.title}</strong>
              </p>
              <form onSubmit={handleOfferSubmit}>
                <div className="form-group">
                  <label htmlFor="offerMessage">Message</label>
                  <textarea
                    id="offerMessage"
                    className="form-control"
                    placeholder="Introduce yourself and explain how you can help..."
                    rows="4"
                    value={matchForm.message}
                    onChange={(e) => setMatchForm({ ...matchForm, message: e.target.value })}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="offerDate">Preferred Date</label>
                  <input
                    type="date"
                    id="offerDate"
                    className="form-control"
                    value={matchForm.scheduledDate}
                    onChange={(e) => setMatchForm({ ...matchForm, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <><span className="spinner spinner-sm"></span> Sending...</> : 'Send Offer'}
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

export default BrowseRequests;
