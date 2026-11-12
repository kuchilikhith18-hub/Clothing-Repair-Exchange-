import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyMatches, acceptMatch, rejectMatch, completeMatch } from '../services/api';
import Alert from '../components/Alert';
import MatchCard from '../components/MatchCard';
import './MyMatches.css';

const MyMatches = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('requester');
  const [matches, setMatches] = useState({ asRequester: [], asVolunteer: [] });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchMatches();
    // eslint-disable-next-line
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await getMyMatches();
      const data = res.data.data || res.data || {};

      // Handle flat array or grouped object from API
      let asRequester = [];
      let asVolunteer = [];

      if (Array.isArray(data)) {
        const userId = user?._id || user?.id;
        asRequester = data.filter(m =>
          (m.requester?._id || m.requester?.id || m.requester) === userId
        );
        asVolunteer = data.filter(m =>
          (m.volunteer?._id || m.volunteer?.id || m.volunteer) === userId
        );
      } else {
        asRequester = data.asRequester || data.requesterMatches || [];
        asVolunteer = data.asVolunteer || data.volunteerMatches || [];
      }

      setMatches({ asRequester, asVolunteer });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load matches.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId) => {
    try {
      await acceptMatch(matchId);
      setAlert({ type: 'success', message: '✅ Match accepted!' });
      fetchMatches();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to accept match.' });
    }
  };

  const handleReject = async (matchId) => {
    try {
      await rejectMatch(matchId);
      setAlert({ type: 'success', message: 'Match declined.' });
      fetchMatches();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to reject match.' });
    }
  };

  const handleComplete = async (matchId) => {
    try {
      await completeMatch(matchId);
      setAlert({ type: 'success', message: '🎉 Marked as completed!' });
      fetchMatches();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to mark complete.' });
    }
  };

  const currentList = tab === 'requester' ? matches.asRequester : matches.asVolunteer;

  const countsByStatus = (list) => ({
    pending:   list.filter(m => m.status === 'pending').length,
    accepted:  list.filter(m => m.status === 'accepted').length,
    completed: list.filter(m => m.status === 'completed').length,
    rejected:  list.filter(m => m.status === 'rejected').length,
  });

  const stats = countsByStatus(currentList);

  return (
    <div className="my-matches-page page">
      <div className="container">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="page-header">
          <h1>🤝 My Matches</h1>
          <p>Track your repair match requests and offers.</p>
        </div>

        {/* Tabs */}
        <div className="matches-tabs">
          <button
            className={`matches-tab ${tab === 'requester' ? 'active' : ''}`}
            onClick={() => setTab('requester')}
          >
            📋 As Requester
            <span className="tab-badge">{matches.asRequester.length}</span>
          </button>
          <button
            className={`matches-tab ${tab === 'volunteer' ? 'active' : ''}`}
            onClick={() => setTab('volunteer')}
          >
            🧵 As Volunteer
            <span className="tab-badge">{matches.asVolunteer.length}</span>
          </button>
        </div>

        {/* Stats Row */}
        {!loading && currentList.length > 0 && (
          <div className="matches-stats">
            <div className="match-stat match-stat-warning">
              <span className="match-stat-num">{stats.pending}</span>
              <span className="match-stat-label">Pending</span>
            </div>
            <div className="match-stat match-stat-info">
              <span className="match-stat-num">{stats.accepted}</span>
              <span className="match-stat-label">Accepted</span>
            </div>
            <div className="match-stat match-stat-success">
              <span className="match-stat-num">{stats.completed}</span>
              <span className="match-stat-label">Completed</span>
            </div>
            <div className="match-stat match-stat-danger">
              <span className="match-stat-num">{stats.rejected}</span>
              <span className="match-stat-label">Rejected</span>
            </div>
          </div>
        )}

        {/* Match List */}
        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : currentList.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">{tab === 'requester' ? '📭' : '🧵'}</span>
            <p>
              {tab === 'requester'
                ? "You haven't received any match offers yet. Post a repair request to get started!"
                : "You haven't offered help on any requests yet. Browse open requests to volunteer!"}
            </p>
            <a
              href={tab === 'requester' ? '/requests/create' : '/requests'}
              className="btn btn-primary"
            >
              {tab === 'requester' ? '✂️ Post a Request' : '🔍 Browse Requests'}
            </a>
          </div>
        ) : (
          <div className="matches-list">
            {currentList.map(match => (
              <MatchCard
                key={match._id || match.id}
                match={match}
                perspective={tab}
                onAccept={handleAccept}
                onReject={handleReject}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMatches;

