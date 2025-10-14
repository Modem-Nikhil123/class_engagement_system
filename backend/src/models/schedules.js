const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    scheduleId: { type: String, required: true, unique: true },
    teacherId: { type: String, required: true },
    classId: { type: String, required: true },
    date: { type: Date, required: true },
    periodNo: { type: Number, required: true },
    subject: { type: String, required: true },
    substituteTeacherId: { type: String },
    status: { type: String, enum: ['scheduled', 'completed', 'pending', 'cancelled'], default: 'scheduled' },
    requestedBy: { type: String }, // Teacher who requested substitution
    acceptedBy: { type: String }, // Teacher who accepted the substitution
    remarks: { type: String }
  },
  { timestamps: true }
);

// Index for efficient queries
scheduleSchema.index({ teacherId: 1, date: 1 });
scheduleSchema.index({ substituteTeacherId: 1, date: 1 });
scheduleSchema.index({ date: 1, status: 1 });
scheduleSchema.index({ requestedBy: 1, status: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);