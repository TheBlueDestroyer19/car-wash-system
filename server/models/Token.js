const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    // Token number resets every day
    tokenNumber: {
      type: Number,
      required: true
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true
    },
    customerName: {
      type: String
    },
    vehicleNumber: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['WAITING', 'IN_SERVICE', 'COMPLETED', 'CANCELLED'],
      default: 'WAITING'
    },
    serviceBay: {
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Make tokenNumber + date unique per day
tokenSchema.index({ date: 1, tokenNumber: 1 }, { unique: true });

module.exports = mongoose.model('Token', tokenSchema);
