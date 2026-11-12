import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>
              <span className="footer-logo">🧵</span> Clothing Repair Exchange
            </h3>
            <p>
              Connecting people who need clothing repairs with skilled volunteers.
              Together, we give clothes a second life and reduce textile waste.
            </p>
          </div>

          <div className="footer-links-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/requests">Browse Requests</Link></li>
              <li><Link to="/volunteers">Volunteers</Link></li>
              <li><Link to="/register">Join Us</Link></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Repair Skills</h4>
            <ul className="footer-links">
              <li><span>✂️ Sewing & Stitching</span></li>
              <li><span>🪡 Patching & Darning</span></li>
              <li><span>🔗 Zipper Repair</span></li>
              <li><span>🧥 Alterations</span></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Our Mission</h4>
            <p className="footer-mission">
              🌿 Reduce textile waste by repairing instead of replacing. Every
              repaired garment keeps fabric out of landfills and builds community
              connections.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Clothing Repair Exchange. Made with 💚 for sustainability.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
