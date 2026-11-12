import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest } from '../services/api';
import Alert from '../components/Alert';
import './CreateRequest.css';

const CLOTHING_TYPES = [
  'T-Shirt', 'Shirt', 'Pants', 'Jeans', 'Dress', 'Skirt', 'Jacket',
  'Coat', 'Sweater', 'Hoodie', 'Suit', 'Blouse', 'Shorts', 'Underwear',
  'Socks', 'Scarf', 'Hat', 'Other',
];

const REPAIR_TYPES = [
  'Sewing', 'Patching', 'Zipper Repair', 'Button Replacement',
  'Hemming', 'Darning', 'Alterations', 'Embroidery', 'Tear Repair',
  'Elastic Replacement', 'Lining Repair', 'Other',
];

const CreateRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clothingType: '',
    repairType: '',
    urgency: 'medium',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    else if (formData.title.length < 5) errs.title = 'Title must be at least 5 characters';
    if (!formData.description.trim()) errs.description = 'Description is required';
    else if (formData.description.length < 20) errs.description = 'Please provide more detail (min. 20 chars)';
    if (!formData.clothingType) errs.clothingType = 'Select a clothing type';
    if (!formData.repairType) errs.repairType = 'Select a repair type';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAlert(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        clothingType: formData.clothingType.trim().toLowerCase(),
        repairType: formData.repairType.trim().toLowerCase(),
        urgency: formData.urgency.trim().toLowerCase(),
        location: formData.location.trim(),
      };
      const res = await createRequest(payload);
      const newId = res.data.data?._id || res.data.data?.id || res.data._id || res.data.id;
      setAlert({ type: 'success', message: 'Repair request created successfully! 🎉' });
      setTimeout(() => {
        navigate(newId ? `/requests/${newId}` : '/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors?.map((e) => e.message).join(', ') ||
        err.response?.data?.message ||
        'Failed to create request. Please try again.';
      setAlert({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-request-page page">
      <div className="container">
        <div className="create-request-wrapper">
          <div className="create-request-card">
            <div className="create-request-header">
              <h1>✂️ Create a Repair Request</h1>
              <p>Describe the clothing item and the type of repair needed</p>
            </div>

            {alert && (
              <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className={`form-control ${errors.title ? 'error' : ''}`}
                  placeholder="e.g., Winter jacket zipper needs fixing"
                  value={formData.title}
                  onChange={handleChange}
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  className={`form-control ${errors.description ? 'error' : ''}`}
                  placeholder="Describe the issue in detail: What's wrong? What material is the garment? Any specific requirements?"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="clothingType">Clothing Type *</label>
                  <select
                    id="clothingType"
                    name="clothingType"
                    className={`form-control ${errors.clothingType ? 'error' : ''}`}
                    value={formData.clothingType}
                    onChange={handleChange}
                  >
                    <option value="">Select clothing type...</option>
                    {CLOTHING_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.clothingType && <span className="error-text">{errors.clothingType}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="repairType">Repair Type *</label>
                  <select
                    id="repairType"
                    name="repairType"
                    className={`form-control ${errors.repairType ? 'error' : ''}`}
                    value={formData.repairType}
                    onChange={handleChange}
                  >
                    <option value="">Select repair type...</option>
                    {REPAIR_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.repairType && <span className="error-text">{errors.repairType}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Urgency *</label>
                <div className="urgency-options">
                  {[
                    { value: 'low', label: 'Low', icon: '🟢', desc: 'No rush' },
                    { value: 'medium', label: 'Medium', icon: '🟡', desc: 'Within a week' },
                    { value: 'high', label: 'High', icon: '🟠', desc: 'Urgent, within days' },
                    { value: 'urgent', label: 'Urgent', icon: '🔴', desc: 'ASAP' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`urgency-option ${formData.urgency === opt.value ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={opt.value}
                        checked={formData.urgency === opt.value}
                        onChange={handleChange}
                      />
                      <span className="urgency-icon">{opt.icon}</span>
                      <span className="urgency-label">{opt.label}</span>
                      <span className="urgency-desc">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-control"
                  placeholder="City, State (helps match with nearby volunteers)"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="create-request-actions">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner spinner-sm"></span> Creating...
                    </>
                  ) : (
                    '📝 Post Request'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateRequest;
