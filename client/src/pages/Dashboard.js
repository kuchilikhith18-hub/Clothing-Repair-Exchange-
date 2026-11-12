import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRequests, getMyMatches, acceptMatch, rejectMatch, completeMatch } from '../services/api';
import RequestCard from '../components/RequestCard';
import MatchCard from '../components/MatchCard';
import Alert from '../components/Alert';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchRequests();
    fetchMatches();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getMyRequests();
      const data = res.data.data || res.data.requests || res.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await getMyMatches();
      const data = res.data.data || res.data.matches || res.data || [];
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptMatch(id);
      setAlert({ type: 'success', message: 'Match accepted!' });
      fetchMatches();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to accept match' });
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectMatch(id);
      setAlert({ type: 'success', message: 'Match rejected.' });
      fetchMatches();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to reject match' });
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeMatch(id);
      setAlert({ type: 'success', message: 'Repair marked as complete! 🎉' });
      fetchMatches();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to complete match' });
    }
  };

  const pendingMatches = matches.filter((m) => m.status === 'pending');
  const activeMatches = matches.filter((m) => m.status === 'accepted');

  return (
    <main className="dashboard-page page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name || 'User'}! 👋</h1>
            <p>Here's an overview of your repair activity</p>
          </div>
          <div className="dashboard-quick-actions">
            <Link to="/requests/create" className="btn btn-primary">
              ✂️ Create Request
            </Link>
            <Link to="/profile" className="btn btn-outline">
              👤 Update Profile
            </Link>
          </div>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="dash-stat-card">
            <span className="dash-stat-icon">📋</span>
            <span className="dash-stat-number">{requests.length}</span>
            <span className="dash-stat-label">My Requests</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">⏳</span>
            <span className="dash-stat-number">{pendingMatches.length}</span>
            <span className="dash-stat-label">Pending Matches</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">✅</span>
            <span className="dash-stat-number">{activeMatches.length}</span>
            <span className="dash-stat-label">Active Repairs</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">🎉</span>
            <span className="dash-stat-number">
              {matches.filter((m) => m.status === 'completed').length}
            </span>
            <span className="dash-stat-label">Completed</span>
          </div>
        </div>

        {/* My Requests Section */}
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>📋 My Repair Requests</h2>
            <Link to="/requests" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>

          {loadingRequests ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          ) : requests.length > 0 ? (
            <div className="dashboard-grid">
              {requests.slice(0, 6).map((req) => (
                <RequestCard key={req._id || req.id} request={req} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>You haven't created any repair requests yet.</p>
              <Link to="/requests/create" className="btn btn-primary btn-sm">
                Create Your First Request
              </Link>
            </div>
          )}
        </section>

        {/* My Matches Section */}
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>🤝 My Matches</h2>
            <Link to="/my-matches" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>

          {loadingMatches ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          ) : matches.length > 0 ? (
            <div className="dashboard-grid">
              {matches.slice(0, 6).map((match) => (
                <MatchCard
                  key={match._id || match.id}
                  match={match}
                  perspective="requester"
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <p>No matches yet. Browse requests to find someone to help!</p>
              <Link to="/requests" className="btn btn-primary btn-sm">
                Browse Requests
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
