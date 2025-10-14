const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    departmentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    hod: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }, // Reference to teacher who is HOD
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);