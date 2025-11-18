const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    customerName: {
      type: String
    },
    vehicleNumber: {
      type: String
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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

// Make tokenNumber + date + shop unique per day
tokenSchema.index({ shop: 1, date: 1, tokenNumber: 1 }, { unique: true });

module.exports = mongoose.model('Token', tokenSchema);
