const mongoose = require("mongoose");

const permanentTimetableSchema = new mongoose.Schema(
  {
    timetableId: { type: String, required: true, unique: true },
    classId: { type: String, required: true },
    subject: { type: String, required: true },
    teacherId: { type: String, required: true },
    dayOfWeek: { type: String, required: true }, 
    slot: { type: String, required: true }, 
    startTime: { type: String },
    endTime: { type: String }, 
    room: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("permanenttimetables", permanentTimetableSchema);
