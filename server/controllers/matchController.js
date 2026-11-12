const Match = require('../models/Match');
const RepairRequest = require('../models/RepairRequest');

// @desc    Create a match offer (volunteer applies to help)
// @route   POST /api/matches
// @access  Private
const createMatch = async (req, res, next) => {
  try {
    const repairRequestId =
      req.body.repairRequestId || req.body.requestId || req.body.request;
    const { message, scheduledDate } = req.body;

    if (!repairRequestId) {
      return res.status(400).json({ message: 'Repair request ID is required' });
    }

    // Verify the repair request exists and is open
    const repairRequest = await RepairRequest.findById(repairRequestId);
    if (!repairRequest) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    if (repairRequest.status !== 'open') {
      return res.status(400).json({ message: 'This repair request is no longer open for matches' });
    }

    // Volunteer cannot match their own request
    if (repairRequest.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot volunteer for your own repair request' });
    }

    // Check user has volunteer role
    if (!['volunteer', 'both'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'You must have a volunteer role to offer help. Update your profile first.',
      });
    }

    // Check for existing match from this volunteer for this request
    const existingMatch = await Match.findOne({
      repairRequest: repairRequestId,
      volunteer: req.user._id,
    });

    if (existingMatch) {
      return res.status(400).json({ message: 'You have already offered to help with this request' });
    }

    const match = await Match.create({
      repairRequest: repairRequestId,
      volunteer: req.user._id,
      requester: repairRequest.user,
      message,
      scheduledDate,
    });

    const populated = await Match.findById(match._id)
      .populate('volunteer', 'name email skills location')
      .populate('requester', 'name email location')
      .populate('repairRequest', 'title clothingType repairType urgency status');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's matches (as volunteer and requester)
// @route   GET /api/matches/my/matches
// @access  Private
const getMyMatches = async (req, res, next) => {
  try {
    const { role, status, page, limit } = req.query;

    let filter = {};

    if (role === 'volunteer') {
      filter.volunteer = req.user._id;
    } else if (role === 'requester') {
      filter.requester = req.user._id;
    } else {
      // Both roles
      filter = {
        $or: [{ volunteer: req.user._id }, { requester: req.user._id }],
      };
    }

    if (status) filter.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [matches, total] = await Promise.all([
      Match.find(filter)
        .populate('volunteer', 'name email skills location')
        .populate('requester', 'name email location')
        .populate('repairRequest', 'title clothingType repairType urgency status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Match.countDocuments(filter),
    ]);

    res.status(200).json({
      data: matches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a match (requester only)
// @route   PUT /api/matches/:id/accept
// @access  Private
const acceptMatch = async (req, res, next) => {
  try {
    let match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Only the requester can accept
    if (match.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the requester can accept this match' });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({ message: `Match cannot be accepted. Current status: ${match.status}` });
    }

    // Update match status
    match.status = 'accepted';
    if (req.body.scheduledDate) {
      match.scheduledDate = req.body.scheduledDate;
    }
    await match.save();

    // Update repair request status and matched volunteer
    await RepairRequest.findByIdAndUpdate(match.repairRequest, {
      status: 'matched',
      matchedVolunteer: match.volunteer,
    });

    // Reject all other pending matches for this request
    await Match.updateMany(
      {
        repairRequest: match.repairRequest,
        _id: { $ne: match._id },
        status: 'pending',
      },
      { status: 'rejected' }
    );

    match = await Match.findById(req.params.id)
      .populate('volunteer', 'name email skills location')
      .populate('requester', 'name email location')
      .populate('repairRequest', 'title clothingType repairType urgency status');

    res.status(200).json(match);
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a match (requester only)
// @route   PUT /api/matches/:id/reject
// @access  Private
const rejectMatch = async (req, res, next) => {
  try {
    let match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Only the requester can reject
    if (match.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the requester can reject this match' });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({ message: `Match cannot be rejected. Current status: ${match.status}` });
    }

    match.status = 'rejected';
    await match.save();

    match = await Match.findById(req.params.id)
      .populate('volunteer', 'name email skills location')
      .populate('requester', 'name email location')
      .populate('repairRequest', 'title clothingType repairType urgency status');

    res.status(200).json(match);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark match as completed (either party)
// @route   PUT /api/matches/:id/complete
// @access  Private
const completeMatch = async (req, res, next) => {
  try {
    let match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Either the requester or volunteer can mark as complete
    const isRequester = match.requester.toString() === req.user._id.toString();
    const isVolunteer = match.volunteer.toString() === req.user._id.toString();

    if (!isRequester && !isVolunteer) {
      return res.status(403).json({ message: 'Not authorized to complete this match' });
    }

    if (match.status !== 'accepted') {
      return res.status(400).json({
        message: `Match cannot be completed. Current status: ${match.status}. Match must be accepted first.`,
      });
    }

    match.status = 'completed';
    match.completedAt = new Date();
    await match.save();

    // Update repair request status
    await RepairRequest.findByIdAndUpdate(match.repairRequest, {
      status: 'completed',
    });

    match = await Match.findById(req.params.id)
      .populate('volunteer', 'name email skills location')
      .populate('requester', 'name email location')
      .populate('repairRequest', 'title clothingType repairType urgency status');

    res.status(200).json(match);
  } catch (error) {
    next(error);
  }
};

module.exports = { createMatch, getMyMatches, acceptMatch, rejectMatch, completeMatch };
