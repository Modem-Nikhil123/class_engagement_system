const mongoose = require('mongoose');

const substituteRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  originalTeacherId: {
    type: String,
    required: true
  },
  originalTeacherName: {
    type: String,
    required: true
  },
  classId: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  room: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'engaged'],
    default: 'pending'
  },
  acceptedBy: {
    type: String,
    default: null
  },
  acceptedByName: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
substituteRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SubstituteRequest', substituteRequestSchema);