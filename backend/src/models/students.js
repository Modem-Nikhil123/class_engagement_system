const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    classYear: { type: String, required: true },
    branch: { type: String, required: true },
    section: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
