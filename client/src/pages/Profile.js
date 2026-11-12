import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateSkills, updateAvailability } from '../services/api';
import Alert from '../components/Alert';
import './Profile.css';

const SKILLS_OPTIONS = [
  'sewing', 'patching', 'zipper repair', 'button replacement',
  'hemming', 'darning', 'alterations', 'embroidery',
];

const DAYS_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [alert, setAlert] = useState(null);

  // Personal info form
  const [infoForm, setInfoForm] = useState({
    name: '', phone: '', bio: '',
    city: '', state: '', zipCode: '',
  });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoErrors, setInfoErrors] = useState({});

  // Skills form
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillsSaving, setSkillsSaving] = useState(false);

  // Availability form
  const [availability, setAvailability] = useState({ days: [], hours: '' });
  const [availSaving, setAvailSaving] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (user) {
      setInfoForm({
        name:     user.name     || '',
        phone:    user.phone    || '',
        bio:      user.bio      || '',
        city:     user.location?.city    || '',
        state:    user.location?.state   || '',
        zipCode:  user.location?.zipCode || '',
      });
      setSelectedSkills(user.skills || []);
      setAvailability({
        days:  user.availability?.days  || [],
        hours: user.availability?.hours || '',
      });
    }
  }, [user]);

  const validateInfo = () => {
    const errs = {};
    if (!infoForm.name.trim()) errs.name = 'Name is required.';
    if (infoForm.phone && !/^\+?[\d\s\-().]{7,15}$/.test(infoForm.phone)) {
      errs.phone = 'Invalid phone number.';
    }
    return errs;
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    const errs = validateInfo();
    if (Object.keys(errs).length) { setInfoErrors(errs); return; }
    setInfoErrors({});
    setInfoSaving(true);
    const payload = {
      name:  infoForm.name.trim(),
      phone: infoForm.phone.trim(),
      bio:   infoForm.bio.trim(),
      location: {
        city:    infoForm.city.trim(),
        state:   infoForm.state.trim(),
        zipCode: infoForm.zipCode.trim(),
      },
    };
    const result = await updateProfile(payload);
    setInfoSaving(false);
    if (result.success) {
      setAlert({ type: 'success', message: '✅ Profile updated successfully!' });
    } else {
      setAlert({ type: 'error', message: result.error || 'Update failed.' });
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSkillsSave = async () => {
    setSkillsSaving(true);
    try {
      await updateSkills({ skills: selectedSkills });
      setAlert({ type: 'success', message: '✅ Skills updated!' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update skills.' });
    } finally {
      setSkillsSaving(false);
    }
  };

  const toggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleAvailSave = async () => {
    setAvailSaving(true);
    try {
      await updateAvailability({ availability });
      setAlert({ type: 'success', message: '✅ Availability updated!' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update availability.' });
    } finally {
      setAvailSaving(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    setPwSaving(true);
    const result = await updateProfile({
      currentPassword: pwForm.currentPassword,
      password: pwForm.newPassword,
    });
    setPwSaving(false);
    if (result.success) {
      setAlert({ type: 'success', message: '✅ Password changed successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setAlert({ type: 'error', message: result.error || 'Failed to change password.' });
    }
  };

  if (authLoading) {
    return <div className="spinner-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="profile-page page">
      <div className="container">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="page-header">
          <h1>👤 My Profile</h1>
          <p>Manage your personal information, skills, and availability.</p>
        </div>

        {/* Profile Avatar Banner */}
        <div className="profile-banner">
          <div className="profile-avatar-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="profile-banner-info">
            <h2>{user?.name || 'User'}</h2>
            <p>{user?.email}</p>
            <span className="badge badge-primary">
              {user?.role === 'both' ? '🤝 Requester & Volunteer' :
               user?.role === 'volunteer' ? '🧵 Volunteer' : '📋 Requester'}
            </span>
          </div>
        </div>

        <div className="profile-sections">
          {/* Personal Info */}
          <section className="profile-section card">
            <h2 className="profile-section-title">📝 Personal Information</h2>
            <form onSubmit={handleInfoSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name" type="text" className={`form-control ${infoErrors.name ? 'error' : ''}`}
                    value={infoForm.name}
                    onChange={e => setInfoForm({ ...infoForm, name: e.target.value })}
                    placeholder="Your full name"
                  />
                  {infoErrors.name && <span className="form-error">{infoErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone" type="tel" className={`form-control ${infoErrors.phone ? 'error' : ''}`}
                    value={infoForm.phone}
                    onChange={e => setInfoForm({ ...infoForm, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                  {infoErrors.phone && <span className="form-error">{infoErrors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio" className="form-control" rows="3"
                  value={infoForm.bio}
                  onChange={e => setInfoForm({ ...infoForm, bio: e.target.value })}
                  placeholder="Tell the community a bit about yourself..."
                />
              </div>

              <h3 className="profile-subsection">📍 Location</h3>
              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city" type="text" className="form-control"
                    value={infoForm.city}
                    onChange={e => setInfoForm({ ...infoForm, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    id="state" type="text" className="form-control"
                    value={infoForm.state}
                    onChange={e => setInfoForm({ ...infoForm, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input
                    id="zipCode" type="text" className="form-control"
                    value={infoForm.zipCode}
                    onChange={e => setInfoForm({ ...infoForm, zipCode: e.target.value })}
                    placeholder="ZIP"
                  />
                </div>
              </div>

              <div className="profile-section-footer">
                <button type="submit" className="btn btn-primary" disabled={infoSaving}>
                  {infoSaving ? <><span className="spinner spinner-sm"></span> Saving...</> : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* Skills */}
          <section className="profile-section card">
            <h2 className="profile-section-title">🧵 My Skills</h2>
            <p className="profile-section-desc">Select the repair skills you can offer as a volunteer.</p>
            <div className="skills-checkboxes">
              {SKILLS_OPTIONS.map(skill => (
                <label key={skill} className={`skill-checkbox-label ${selectedSkills.includes(skill) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                  />
                  <span>{skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
                </label>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <div className="profile-skills-preview">
                <span className="text-muted">Selected: </span>
                {selectedSkills.map(s => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>
            )}
            <div className="profile-section-footer">
              <button className="btn btn-primary" onClick={handleSkillsSave} disabled={skillsSaving}>
                {skillsSaving ? <><span className="spinner spinner-sm"></span> Saving...</> : '💾 Save Skills'}
              </button>
            </div>
          </section>

          {/* Availability */}
          <section className="profile-section card">
            <h2 className="profile-section-title">📅 Availability</h2>
            <p className="profile-section-desc">Let requesters know when you're available to help.</p>

            <div className="form-group">
              <label>Available Days</label>
              <div className="days-checkboxes">
                {DAYS_OPTIONS.map(day => (
                  <label key={day} className={`day-label ${availability.days.includes(day) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={availability.days.includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    <span>{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hours">Available Hours</label>
              <input
                id="hours" type="text" className="form-control"
                placeholder="e.g. 9am–5pm, Evenings, Weekends"
                value={availability.hours}
                onChange={e => setAvailability({ ...availability, hours: e.target.value })}
              />
            </div>
            <div className="profile-section-footer">
              <button className="btn btn-primary" onClick={handleAvailSave} disabled={availSaving}>
                {availSaving ? <><span className="spinner spinner-sm"></span> Saving...</> : '💾 Save Availability'}
              </button>
            </div>
          </section>

          {/* Change Password */}
          <section className="profile-section card">
            <h2 className="profile-section-title">🔒 Change Password</h2>
            <form onSubmit={handlePwSubmit}>
              <div className="form-group">
                <label htmlFor="currentPw">Current Password</label>
                <div className="input-pw-wrap">
                  <input
                    id="currentPw"
                    type={showPw ? 'text' : 'password'}
                    className="form-control"
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    placeholder="Current password"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="newPw">New Password</label>
                  <input
                    id="newPw"
                    type={showPw ? 'text' : 'password'}
                    className="form-control"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPw">Confirm New Password</label>
                  <input
                    id="confirmPw"
                    type={showPw ? 'text' : 'password'}
                    className="form-control"
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>
              <label className="show-pw-label">
                <input type="checkbox" checked={showPw} onChange={() => setShowPw(!showPw)} />
                Show passwords
              </label>
              <div className="profile-section-footer">
                <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                  {pwSaving ? <><span className="spinner spinner-sm"></span> Saving...</> : '🔑 Change Password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;

