const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  getRepairRequests,
  getRepairRequest,
  createRepairRequest,
  updateRepairRequest,
  deleteRepairRequest,
  getMyRepairRequests,
} = require('../controllers/repairRequestController');

const router = express.Router();

// @route   GET /api/requests/my/requests
// Must be defined before /:id to avoid route conflict
router.get('/my/requests', auth, getMyRepairRequests);

// @route   GET /api/requests
router.get('/', getRepairRequests);

// @route   GET /api/requests/:id
router.get('/:id', getRepairRequest);

// Helper to normalize repair request payload
const normalizeRequestData = (req, res, next) => {
  if (req.body.clothingType) {
    req.body.clothingType = String(req.body.clothingType).trim().toLowerCase();
  }

  if (req.body.repairType) {
    let rt = String(req.body.repairType).trim().toLowerCase();
    // Normalize phrases to standard keywords
    if (rt.includes('button')) rt = 'button';
    else if (rt.includes('zipper')) rt = 'zipper';
    else if (rt.includes('tear')) rt = 'tear';
    else if (rt.includes('elastic')) rt = 'elastic';
    else if (rt.includes('lining')) rt = 'lining';
    else if (rt.includes('sew') || rt.includes('seam') || rt.includes('stitch')) rt = 'seam';
    else if (rt.includes('hem')) rt = 'hem';
    else if (rt.includes('patch')) rt = 'patch';
    else if (rt.includes('alter')) rt = 'alterations';
    else if (rt.includes('darn')) rt = 'darning';
    else if (rt.includes('embroid')) rt = 'embroidery';
    req.body.repairType = rt;
  }

  if (req.body.urgency) {
    req.body.urgency = String(req.body.urgency).trim().toLowerCase();
  }

  if (typeof req.body.location === 'string') {
    const rawLoc = req.body.location.trim();
    const parts = rawLoc.split(',').map((p) => p.trim());
    req.body.location = {
      city: parts[0] || '',
      state: parts[1] || '',
      zipCode: parts[2] || '',
      full: rawLoc,
    };
  } else if (req.body.location && typeof req.body.location === 'object') {
    const full = [req.body.location.city, req.body.location.state, req.body.location.zipCode]
      .filter(Boolean)
      .join(', ');
    req.body.location.full = req.body.location.full || full;
  }

  next();
};

// @route   POST /api/requests
router.post(
  '/',
  auth,
  normalizeRequestData,
  [
    body('title').trim().notEmpty().withMessage('Title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('description').trim().notEmpty().withMessage('Description is required')
      .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('clothingType')
      .trim()
      .notEmpty()
      .withMessage('Clothing type is required'),
    body('repairType')
      .trim()
      .notEmpty()
      .withMessage('Repair type is required'),
    body('urgency')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Urgency must be low, medium, high, or urgent'),
    body('location.city').optional().trim(),
    body('location.state').optional().trim(),
    body('location.zipCode').optional().trim(),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Each image must be a valid URL'),
  ],
  validate,
  createRepairRequest
);

// @route   PUT /api/requests/:id
router.put(
  '/:id',
  auth,
  normalizeRequestData,
  [
    body('title')
      .optional().trim().notEmpty().withMessage('Title cannot be empty')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('description')
      .optional().trim().notEmpty().withMessage('Description cannot be empty')
      .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('clothingType')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Clothing type cannot be empty'),
    body('repairType')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Repair type cannot be empty'),
    body('urgency')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Urgency must be low, medium, high, or urgent'),
    body('status')
      .optional()
      .isIn(['open', 'matched', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    body('location.city').optional().trim(),
    body('location.state').optional().trim(),
    body('location.zipCode').optional().trim(),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Each image must be a valid URL'),
  ],
  validate,
  updateRepairRequest
);

// @route   DELETE /api/requests/:id
router.delete('/:id', auth, deleteRepairRequest);

module.exports = router;
