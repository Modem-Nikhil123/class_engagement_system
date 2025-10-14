const mongoose = require("mongoose");

const temporaryTimetableSchema = new mongoose.Schema(
  {
    tempId: { type: String, required: true, unique: true },
    classId: { type: String, required: true },
    date: { type: Date, required: true },
    changes: [{
      periodNo: { type: Number, required: true },
      originalTeacherId: { type: String, required: true },
      substituteTeacherId: { type: String },
      subject: { type: String, required: true },
      status: { type: String, enum: ['scheduled', 'cancelled', 'substituted'], default: 'scheduled' }
    }]
  },
  { timestamps: true }
);

// Index for efficient queries
temporaryTimetableSchema.index({ classId: 1, date: 1 });
temporaryTimetableSchema.index({ date: 1 });

module.exports = mongoose.model("TemporaryTimetable", temporaryTimetableSchema);