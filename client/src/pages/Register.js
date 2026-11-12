import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import './Register.css';

const SKILLS_OPTIONS = [
  'Sewing',
  'Patching',
  'Zipper Repair',
  'Button Replacement',
  'Hemming',
  'Darning',
  'Alterations',
  'Embroidery',
];

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'requester';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    phone: '',
    location: '',
    skills: [],
    availability: {
      days: [],
      hours: '',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const isVolunteer = formData.role === 'volunteer' || formData.role === 'both';

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (isVolunteer && formData.skills.length === 0)
      errs.skills = 'Select at least one skill';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSkillToggle = (skill) => {
    const updated = formData.skills.includes(skill)
      ? formData.skills.filter((s) => s !== skill)
      : [...formData.skills, skill];
    setFormData({ ...formData, skills: updated });
    if (errors.skills && updated.length > 0) setErrors({ ...errors, skills: '' });
  };

  const handleDayToggle = (day) => {
    const days = formData.availability.days.includes(day)
      ? formData.availability.days.filter((d) => d !== day)
      : [...formData.availability.days, day];
    setFormData({
      ...formData,
      availability: { ...formData.availability, days },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAlert(null);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
      phone: formData.phone.trim(),
      location: formData.location.trim(),
    };

    if (isVolunteer) {
      payload.skills = formData.skills.map((s) => s.toLowerCase());
      payload.availability = formData.availability;
    }

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setAlert({ type: 'error', message: result.error });
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <main className="register-page page">
      <div className="container">
        <div className="auth-wrapper">
          <div className="auth-card auth-card-wide">
            <div className="auth-header">
              <span className="auth-icon">✂️</span>
              <h1>Join Our Community</h1>
              <p>Create your account and start repairing or requesting</p>
            </div>

            {alert && (
              <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-control ${errors.name ? 'error' : ''}`}
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? 'error' : ''}`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className={`form-control ${errors.password ? 'error' : ''}`}
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone (optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location (optional)</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-control"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>I want to... *</label>
                <div className="role-selector">
                  <label className={`role-option ${formData.role === 'requester' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="requester"
                      checked={formData.role === 'requester'}
                      onChange={handleChange}
                    />
                    <span className="role-icon">👕</span>
                    <span className="role-label">Get Repairs</span>
                    <span className="role-desc">Post repair requests</span>
                  </label>
                  <label className={`role-option ${formData.role === 'volunteer' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="volunteer"
                      checked={formData.role === 'volunteer'}
                      onChange={handleChange}
                    />
                    <span className="role-icon">🪡</span>
                    <span className="role-label">Volunteer</span>
                    <span className="role-desc">Help with repairs</span>
                  </label>
                  <label className={`role-option ${formData.role === 'both' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="both"
                      checked={formData.role === 'both'}
                      onChange={handleChange}
                    />
                    <span className="role-icon">🤝</span>
                    <span className="role-label">Both</span>
                    <span className="role-desc">Request & volunteer</span>
                  </label>
                </div>
              </div>

              {isVolunteer && (
                <div className="volunteer-fields">
                  <div className="form-group">
                    <label>Repair Skills *</label>
                    <div className="skills-grid">
                      {SKILLS_OPTIONS.map((skill) => (
                        <label
                          key={skill}
                          className={`skill-checkbox ${
                            formData.skills.includes(skill) ? 'checked' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.skills.includes(skill)}
                            onChange={() => handleSkillToggle(skill)}
                          />
                          <span className="skill-checkmark">✓</span>
                          <span>{skill}</span>
                        </label>
                      ))}
                    </div>
                    {errors.skills && <span className="error-text">{errors.skills}</span>}
                  </div>

                  <div className="form-group">
                    <label>Availability</label>
                    <div className="days-grid">
                      {daysOfWeek.map((day) => (
                        <label
                          key={day}
                          className={`day-checkbox ${
                            formData.availability.days.includes(day) ? 'checked' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.availability.days.includes(day)}
                            onChange={() => handleDayToggle(day)}
                          />
                          <span>{day.substring(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="hours">Available Hours</label>
                    <input
                      type="text"
                      id="hours"
                      className="form-control"
                      placeholder="e.g., 9 AM - 5 PM"
                      value={formData.availability.hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availability: { ...formData.availability, hours: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner spinner-sm"></span> Creating Account...
                  </>
                ) : (
                  '🎉 Create Account'
                )}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
