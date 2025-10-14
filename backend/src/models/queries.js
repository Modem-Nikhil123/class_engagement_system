const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    queryId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    teacherId: { type: String }, // Optional - can be general query
    subject: { type: String },
    message: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: ['attendance', 'timetable', 'substitute', 'delay', 'general']
    },
    status: { 
      type: String, 
      required: true, 
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    adminResponse: { type: String },
    resolvedBy: { type: String }, // Admin who resolved
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

// Index for efficient queries
querySchema.index({ studentId: 1, status: 1 });
querySchema.index({ teacherId: 1, status: 1 });
querySchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model("Query", querySchema);