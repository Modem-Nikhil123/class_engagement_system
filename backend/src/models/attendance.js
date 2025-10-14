const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    attendanceId: { type: String, required: true, unique: true },
    classId: { type: String, required: true },
    date: { type: Date, required: true },
    periodNo: { type: Number, required: true },
    studentId: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent'], required: true },
    markedBy: { type: String }, // Teacher who marked attendance
    remarks: { type: String }
  },
  { timestamps: true }
);

// Index for efficient queries
attendanceSchema.index({ classId: 1, date: 1, periodNo: 1 });
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);