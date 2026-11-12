import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRequests } from '../services/api';
import RequestCard from '../components/RequestCard';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredRequests, setFeaturedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await getRequests({ limit: 6, status: 'open' });
        const data = res.data.data || res.data.requests || res.data || [];
        setFeaturedRequests(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (err) {
        setFeaturedRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <main className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Give Your Clothes a <span className="hero-highlight">Second Life</span>
            </h1>
            <p className="hero-subtitle">
              Connect with skilled volunteers who can repair your beloved clothing.
              Reduce waste, build community, and keep your favorite garments alive. 🌿
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/requests/create" className="btn btn-primary btn-lg">
                    ✂️ Post a Repair Request
                  </Link>
                  <Link to="/requests" className="btn btn-outline btn-lg">
                    Browse Requests
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    🚀 Get Started
                  </Link>
                  <Link to="/register?role=volunteer" className="btn btn-secondary btn-lg">
                    🤝 Volunteer
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-icon-grid">
              <span className="hero-emoji hero-emoji-1">🧵</span>
              <span className="hero-emoji hero-emoji-2">👕</span>
              <span className="hero-emoji hero-emoji-3">✂️</span>
              <span className="hero-emoji hero-emoji-4">🪡</span>
              <span className="hero-emoji hero-emoji-5">🧥</span>
              <span className="hero-emoji hero-emoji-6">💚</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to get your clothes repaired</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">📝</div>
              <h3>Post a Repair Request</h3>
              <p>
                Describe the clothing item that needs repair, the type of fix needed,
                and your preferred timeline.
              </p>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🤝</div>
              <h3>Get Matched with a Volunteer</h3>
              <p>
                Skilled volunteers browse requests and offer their expertise.
                Accept the perfect match for your repair.
              </p>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">✨</div>
              <h3>Get Your Clothes Fixed</h3>
              <p>
                Coordinate with your volunteer, get your clothes repaired,
                and enjoy your refreshed wardrobe!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">📋</span>
              <span className="stat-number">150+</span>
              <span className="stat-label">Repair Requests</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🧑‍🔧</span>
              <span className="stat-number">80+</span>
              <span className="stat-label">Skilled Volunteers</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <span className="stat-number">120+</span>
              <span className="stat-label">Completed Repairs</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🌍</span>
              <span className="stat-number">25+</span>
              <span className="stat-label">Communities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Requests */}
      <section className="featured-section">
        <div className="container">
          <div className="featured-header">
            <div>
              <h2 className="section-title">Open Repair Requests</h2>
              <p className="section-subtitle">These items need your help!</p>
            </div>
            <Link to="/requests" className="btn btn-outline">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          ) : featuredRequests.length > 0 ? (
            <div className="featured-grid">
              {featuredRequests.map((req) => (
                <RequestCard key={req._id || req.id} request={req} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No open requests yet. Be the first to post one!</p>
              <Link to="/requests/create" className="btn btn-primary">
                Create Request
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Make a Difference?</h2>
            <p>
              Whether you need a repair or have the skills to help, join our
              community of sustainable fashion advocates. 🌱
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Join Now — It's Free
              </Link>
              <Link to="/requests" className="btn btn-outline btn-lg">
                Browse Requests
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
