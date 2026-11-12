import React, { useState, useEffect } from 'react';
import { getVolunteers } from '../services/api';
import VolunteerCard from '../components/VolunteerCard';
import './Volunteers.css';

const SKILLS_LIST = [
  'sewing', 'patching', 'zipper repair', 'button replacement',
  'hemming', 'darning', 'alterations', 'embroidery',
];

const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ skill: '', day: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVolunteers();
    // eslint-disable-next-line
  }, [filters.skill, filters.day]);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.skill) params.skills = filters.skill;
      if (filters.day)   params.day    = filters.day;
      const res = await getVolunteers(params);
      const data = res.data.data || res.data.volunteers || res.data || [];
      setVolunteers(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Failed to load volunteers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ skill: '', day: '', search: '' });
  };

  const displayed = filters.search
    ? volunteers.filter(v => {
        const q = filters.search.toLowerCase();
        return (
          (v.name || '').toLowerCase().includes(q) ||
          (v.bio || '').toLowerCase().includes(q) ||
          (v.skills || []).some(s => s.toLowerCase().includes(q))
        );
      })
    : volunteers;

  return (
    <div className="volunteers-page page">
      <div className="container">
        <div className="page-header">
          <h1>🧑‍🔧 Our Volunteers</h1>
          <p>Find skilled community members ready to help repair your clothing.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="volunteers-toolbar">
          <input
            type="search"
            className="form-control volunteers-search"
            placeholder="🔍 Search by name, bio, or skill..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            🎛️ Filters {(filters.skill || filters.day) ? '(active)' : ''}
          </button>
          {(filters.skill || filters.day || filters.search) && (
            <button className="btn btn-sm" onClick={handleReset} style={{ background: '#eee', color: '#333' }}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="volunteers-filter-panel">
            <div className="filter-group">
              <label>Skill</label>
              <select
                className="form-control"
                value={filters.skill}
                onChange={(e) => handleFilterChange('skill', e.target.value)}
              >
                <option value="">All Skills</option>
                {SKILLS_LIST.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Available Day</label>
              <select
                className="form-control"
                value={filters.day}
                onChange={(e) => handleFilterChange('day', e.target.value)}
              >
                <option value="">Any Day</option>
                {DAYS_LIST.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : error ? (
          <div className="volunteers-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button className="btn btn-outline" onClick={fetchVolunteers}>Retry</button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🧵</span>
            <p>No volunteers found matching your criteria.</p>
            <button className="btn btn-outline" onClick={handleReset}>Clear Filters</button>
          </div>
        ) : (
          <>
            <p className="volunteers-count">{displayed.length} volunteer{displayed.length !== 1 ? 's' : ''} found</p>
            <div className="volunteers-grid">
              {displayed.map(v => (
                <VolunteerCard key={v._id || v.id} volunteer={v} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Volunteers;

