const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { register, login, getMe, updateMe } = require('../controllers/authController');

const router = express.Router();

const normalizeUserData = (req, res, next) => {
  if (Array.isArray(req.body.skills)) {
    req.body.skills = req.body.skills.map((s) => String(s).trim().toLowerCase());
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

const ALLOWED_SKILLS = [
  'sewing',
  'patching',
  'zipper repair',
  'button replacement',
  'hemming',
  'darning',
  'alterations',
  'embroidery',
  'other',
];

// @route   POST /api/auth/register
router.post(
  '/register',
  normalizeUserData,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['requester', 'volunteer', 'both'])
      .withMessage('Role must be requester, volunteer, or both'),
    body('phone').optional().trim(),
    body('location.city').optional().trim(),
    body('location.state').optional().trim(),
    body('location.zipCode').optional().trim(),
    body('skills')
      .optional()
      .isArray()
      .withMessage('Skills must be an array'),
    body('skills.*')
      .optional()
      .isIn(ALLOWED_SKILLS)
      .withMessage('Invalid skill value'),
    body('availability.days')
      .optional()
      .isArray()
      .withMessage('Days must be an array'),
    body('availability.days.*')
      .optional()
      .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
      .withMessage('Invalid day value'),
    body('availability.hours').optional().trim(),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  ],
  validate,
  register
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// @route   GET /api/auth/me
router.get('/me', auth, getMe);

// @route   PUT /api/auth/me
router.put(
  '/me',
  auth,
  normalizeUserData,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('role')
      .optional()
      .isIn(['requester', 'volunteer', 'both'])
      .withMessage('Role must be requester, volunteer, or both'),
    body('phone').optional().trim(),
    body('location.city').optional().trim(),
    body('location.state').optional().trim(),
    body('location.zipCode').optional().trim(),
    body('skills')
      .optional()
      .isArray()
      .withMessage('Skills must be an array'),
    body('skills.*')
      .optional()
      .isIn(ALLOWED_SKILLS)
      .withMessage('Invalid skill value'),
    body('availability.days')
      .optional()
      .isArray()
      .withMessage('Days must be an array'),
    body('availability.days.*')
      .optional()
      .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
      .withMessage('Invalid day value'),
    body('availability.hours').optional().trim(),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  updateMe
);

module.exports = router;
