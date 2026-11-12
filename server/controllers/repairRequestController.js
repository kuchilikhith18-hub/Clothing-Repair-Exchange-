const RepairRequest = require('../models/RepairRequest');

// @desc    Get all open repair requests (with filters)
// @route   GET /api/requests
// @access  Public
const getRepairRequests = async (req, res, next) => {
  try {
    const { clothingType, repairType, urgency, city, state, zipCode, status, page, limit } = req.query;

    const filter = {};

    // Default to showing open requests unless a specific status is requested
    filter.status = status || 'open';

    if (clothingType) filter.clothingType = clothingType;
    if (repairType) filter.repairType = repairType;
    if (urgency) filter.urgency = urgency;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (zipCode) filter['location.zipCode'] = zipCode;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      RepairRequest.find(filter)
        .populate('user', 'name email location')
        .populate('matchedVolunteer', 'name email skills')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      RepairRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      data: requests,
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

// @desc    Get single repair request
// @route   GET /api/requests/:id
// @access  Public
const getRepairRequest = async (req, res, next) => {
  try {
    const request = await RepairRequest.findById(req.params.id)
      .populate('user', 'name email location phone')
      .populate('matchedVolunteer', 'name email skills location');

    if (!request) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
};

// @desc    Create repair request
// @route   POST /api/requests
// @access  Private
const createRepairRequest = async (req, res, next) => {
  try {
    const { title, description, clothingType, repairType, urgency, location, images } = req.body;

    const request = await RepairRequest.create({
      user: req.user._id,
      title,
      description,
      clothingType,
      repairType,
      urgency,
      location,
      images,
    });

    const populated = await RepairRequest.findById(request._id).populate(
      'user',
      'name email location'
    );

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update repair request
// @route   PUT /api/requests/:id
// @access  Private (owner only)
const updateRepairRequest = async (req, res, next) => {
  try {
    let request = await RepairRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    // Check ownership
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    const allowedFields = [
      'title',
      'description',
      'clothingType',
      'repairType',
      'urgency',
      'location',
      'images',
      'status',
    ];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    request = await RepairRequest.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email location')
      .populate('matchedVolunteer', 'name email skills');

    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete repair request
// @route   DELETE /api/requests/:id
// @access  Private (owner only)
const deleteRepairRequest = async (req, res, next) => {
  try {
    const request = await RepairRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    // Check ownership
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await RepairRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Repair request deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's repair requests
// @route   GET /api/requests/my/requests
// @access  Private
const getMyRepairRequests = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      RepairRequest.find(filter)
        .populate('matchedVolunteer', 'name email skills')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      RepairRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      data: requests,
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

module.exports = {
  getRepairRequests,
  getRepairRequest,
  createRepairRequest,
  updateRepairRequest,
  deleteRepairRequest,
  getMyRepairRequests,
};
