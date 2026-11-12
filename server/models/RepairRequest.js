const mongoose = require('mongoose');

const repairRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    clothingType: {
      type: String,
      required: [true, 'Clothing type is required'],
      lowercase: true,
      trim: true,
    },
    repairType: {
      type: String,
      required: [true, 'Repair type is required'],
      lowercase: true,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      lowercase: true,
      trim: true,
    },
    location: {
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      zipCode: { type: String, trim: true, default: '' },
      full: { type: String, trim: true, default: '' },
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
    },
    matchedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Index for filtering
repairRequestSchema.index({ status: 1, clothingType: 1, repairType: 1, urgency: 1 });
repairRequestSchema.index({ 'location.zipCode': 1 });
repairRequestSchema.index({ user: 1 });

module.exports = mongoose.model('RepairRequest', repairRequestSchema);
