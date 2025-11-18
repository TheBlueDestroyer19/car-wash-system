const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
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

module.exports = mongoose.model('Token', tokenSchema);
