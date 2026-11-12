const User = require('../models/User');

// @desc    Get all volunteers (with filters)
// @route   GET /api/volunteers
// @access  Public
const getVolunteers = async (req, res, next) => {
  try {
    const { skills, day, city, state, zipCode, page, limit } = req.query;

    const filter = {
      role: { $in: ['volunteer', 'both'] },
    };

    if (skills) {
      // Support comma-separated skills: ?skills=sewing,patching
      const skillList = skills.split(',').map((s) => s.trim());
      filter.skills = { $in: skillList };
    }

    if (day) {
      // Support filtering by available day: ?day=Monday
      filter['availability.days'] = { $in: [day] };
    }

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (zipCode) filter['location.zipCode'] = zipCode;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [volunteers, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      data: volunteers,
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

// @desc    Get single volunteer profile
// @route   GET /api/volunteers/:id
// @access  Public
const getVolunteer = async (req, res, next) => {
  try {
    const volunteer = await User.findById(req.params.id).select('-password');

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    if (!['volunteer', 'both'].includes(volunteer.role)) {
      return res.status(404).json({ message: 'User is not a volunteer' });
    }

    res.status(200).json(volunteer);
  } catch (error) {
    next(error);
  }
};

// @desc    Update volunteer skills
// @route   PUT /api/volunteers/skills
// @access  Private
const updateSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;

    // Ensure user has volunteer role
    const roleUpdate = {};
    if (req.user.role === 'requester') {
      roleUpdate.role = 'both';
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { skills, ...roleUpdate },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update volunteer availability
// @route   PUT /api/volunteers/availability
// @access  Private
const updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    // Ensure user has volunteer role
    const roleUpdate = {};
    if (req.user.role === 'requester') {
      roleUpdate.role = 'both';
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { availability, ...roleUpdate },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getVolunteers, getVolunteer, updateSkills, updateAvailability };
