const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    classId: { type: String, required: true, unique: true },
    className: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: Number, required: true },
    section: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);