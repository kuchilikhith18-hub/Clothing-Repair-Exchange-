const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  getVolunteers,
  getVolunteer,
  updateSkills,
  updateAvailability,
} = require('../controllers/volunteerController');

const router = express.Router();

// @route   GET /api/volunteers
router.get('/', getVolunteers);

// @route   GET /api/volunteers/:id
router.get('/:id', getVolunteer);

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

// @route   PUT /api/volunteers/skills
router.put(
  '/skills',
  auth,
  (req, res, next) => {
    if (Array.isArray(req.body.skills)) {
      req.body.skills = req.body.skills.map((s) => String(s).trim().toLowerCase());
    }
    next();
  },
  [
    body('skills')
      .isArray({ min: 1 })
      .withMessage('Skills must be a non-empty array'),
    body('skills.*')
      .isIn(ALLOWED_SKILLS)
      .withMessage('Invalid skill provided'),
  ],
  validate,
  updateSkills
);

// @route   PUT /api/volunteers/availability
router.put(
  '/availability',
  auth,
  [
    body('availability').isObject().withMessage('Availability must be an object'),
    body('availability.days')
      .isArray()
      .withMessage('Days must be an array'),
    body('availability.days.*')
      .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
      .withMessage('Invalid day. Must be a valid weekday name'),
    body('availability.hours')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Hours cannot be empty if provided'),
  ],
  validate,
  updateAvailability
);

module.exports = router;
