const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    repairRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RepairRequest',
      required: [true, 'Repair request is required'],
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Volunteer is required'],
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    scheduledDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Prevent duplicate match offers from the same volunteer for the same request
matchSchema.index({ repairRequest: 1, volunteer: 1 }, { unique: true });
matchSchema.index({ volunteer: 1, status: 1 });
matchSchema.index({ requester: 1, status: 1 });

module.exports = mongoose.model('Match', matchSchema);
