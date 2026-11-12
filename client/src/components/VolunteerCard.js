import React from 'react';
import { Link } from 'react-router-dom';
import './VolunteerCard.css';

const VolunteerCard = ({ volunteer }) => {
  const formatLocation = (loc) => {
    if (!loc) return '';
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object') {
      return loc.full || [loc.city, loc.state, loc.zipCode].filter(Boolean).join(', ') || '';
    }
    return '';
  };

  const name = volunteer.name || volunteer.user?.name || 'Volunteer';
  const skills = volunteer.skills || [];
  const availability = volunteer.availability || {};
  const location = formatLocation(volunteer.location || volunteer.user?.location);
  const bio = volunteer.bio || volunteer.user?.bio || '';
  const id = volunteer._id || volunteer.id || volunteer.user?._id;

  return (
    <article className="volunteer-card">
      <div className="volunteer-card-header">
        <div className="volunteer-card-avatar">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="volunteer-card-info">
          <h3 className="volunteer-card-name">{name}</h3>
          {location && (
            <span className="volunteer-card-location">📍 {location}</span>
          )}
        </div>
      </div>

      {bio && (
        <p className="volunteer-card-bio">
          {bio.length > 100 ? bio.substring(0, 100) + '...' : bio}
        </p>
      )}

      {skills.length > 0 && (
        <div className="volunteer-card-skills">
          {skills.map((skill, index) => (
            <span key={index} className="chip">
              {skill}
            </span>
          ))}
        </div>
      )}

      {availability && (availability.days || availability.hours) && (
        <div className="volunteer-card-availability">
          <span className="volunteer-card-avail-label">🕐 Available:</span>
          {availability.days && Array.isArray(availability.days) && (
            <span className="volunteer-card-avail-text">
              {availability.days.join(', ')}
            </span>
          )}
          {availability.hours && (
            <span className="volunteer-card-avail-text">{availability.hours}</span>
          )}
        </div>
      )}

      <div className="volunteer-card-footer">
        {id && (
          <Link to={`/volunteers/${id}`} className="btn btn-outline btn-sm">
            View Profile
          </Link>
        )}
      </div>
    </article>
  );
};

export default VolunteerCard;
