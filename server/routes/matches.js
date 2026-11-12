const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  createMatch,
  getMyMatches,
  acceptMatch,
  rejectMatch,
  completeMatch,
} = require('../controllers/matchController');

const router = express.Router();

// @route   POST /api/matches
router.post(
  '/',
  auth,
  (req, res, next) => {
    // Normalize request ID field
    if (!req.body.repairRequestId) {
      req.body.repairRequestId = req.body.requestId || req.body.request;
    }
    // If scheduledDate is empty string, remove it so validation passes
    if (!req.body.scheduledDate) {
      delete req.body.scheduledDate;
    }
    next();
  },
  [
    body('repairRequestId')
      .notEmpty()
      .withMessage('Repair request ID is required')
      .isMongoId()
      .withMessage('Invalid repair request ID'),
    body('message')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Message cannot exceed 1000 characters'),
    body('scheduledDate')
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage('Scheduled date must be a valid date'),
  ],
  validate,
  createMatch
);

// @route   GET /api/matches/my/matches
router.get('/my/matches', auth, getMyMatches);

// @route   PUT /api/matches/:id/accept
router.put(
  '/:id/accept',
  auth,
  (req, res, next) => {
    if (!req.body.scheduledDate) {
      delete req.body.scheduledDate;
    }
    next();
  },
  [
    body('scheduledDate')
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage('Scheduled date must be a valid date'),
  ],
  validate,
  acceptMatch
);

// @route   PUT /api/matches/:id/reject
router.put('/:id/reject', auth, rejectMatch);

// @route   PUT /api/matches/:id/complete
router.put('/:id/complete', auth, completeMatch);

module.exports = router;
