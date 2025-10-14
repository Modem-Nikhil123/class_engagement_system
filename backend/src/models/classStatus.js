const mongoose = require("mongoose");

const classStatusSchema = new mongoose.Schema(
  {
    statusId: { type: String, required: true, unique: true },
    classId: { type: String, required: true },
    teacherId: { type: String, required: true },
    date: { type: Date, required: true },
    periodNo: { type: Number, required: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['engaged', 'not_taking', 'delayed', 'absent', 'assigning_substitute'],
      default: 'engaged'
    },
    delayMinutes: { type: Number, default: 0 },
    substituteTeacherId: { type: String },
    substituteTeacherName: { type: String },
    studentMarkedAbsent: { type: Boolean, default: false },
    studentReporterId: { type: String }, // Student who marked teacher absent
    teacherNotified: { type: Boolean, default: false },
    teacherResponse: { type: String }, // Teacher's response to absence report
    graceTimeExpiry: { type: Date }, // When grace period expires
    remarks: { type: String },
    updatedBy: { type: String }, // Who last updated the status
    room: { type: String },
    startTime: { type: String },
    endTime: { type: String }
  },
  { timestamps: true }
);

// Index for efficient queries
classStatusSchema.index({ classId: 1, date: 1 });
classStatusSchema.index({ teacherId: 1, date: 1 });
classStatusSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("ClassStatus", classStatusSchema);