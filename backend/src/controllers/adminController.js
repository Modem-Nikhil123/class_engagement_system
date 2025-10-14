const bcrypt = require('bcrypt');
const teacherModel = require('../models/teachers');
const studentModel = require('../models/students');
const departmentModel = require('../models/departments');
const permanentTimetable = require('../models/permanentTimetable');
const queryModel = require('../models/queries');
const userModel = require('../models/user');
const classStatusModel = require('../models/classStatus');
const substituteRequests = require('../models/substituteRequests');

// Helper function to get HOD's department
const getHodDepartment = async (userId) => {
  const teacher = await teacherModel.findOne({ teacherId: userId });
  if (!teacher) return null;
  const department = await departmentModel.findOne({ hod: teacher._id });
  return department;
};

// Department Management
const getAllDepartments = async (req, res) => {
  try {
    const departments = await departmentModel.find().populate('hod', 'name').sort({ name: 1 });
    res.status(200).json(departments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addDepartment = async (req, res) => {
  try {
    const { departmentId, name, description } = req.body;

    if (!departmentId || !name) {
      return res.status(400).json({ message: "Department ID and name are required" });
    }

    // Check if department already exists
    const existingDepartment = await departmentModel.findOne({ $or: [{ departmentId }, { name }] });
    if (existingDepartment) {
      return res.status(400).json({ message: "Department with this ID or name already exists" });
    }

    const department = new departmentModel({
      departmentId,
      name,
      description
    });

    await department.save();
    res.status(201).json({ message: "Department added successfully", department });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const assignHOD = async (req, res) => {
  try {
    const { departmentId, teacherId } = req.body;

    if (!departmentId || !teacherId) {
      return res.status(400).json({ message: "Department ID and Teacher ID are required" });
    }

    // Check if department exists
    const department = await departmentModel.findOne({ departmentId });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check if teacher exists
    const teacher = await teacherModel.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if teacher belongs to this department
    // if (!teacher.department || !teacher.department.equals(departmentId)) {
    //   return res.status(400).json({ message: "Teacher does not belong to this department" });
    // }

    // Check if teacher is already HOD for another department
    const existingHodDepartment = await departmentModel.findOne({ hod: teacher._id });
    if (existingHodDepartment && !existingHodDepartment._id.equals(department._id)) {
      return res.status(400).json({ message: "Teacher is already HOD for another department" });
    }

    // If there's an existing HOD for this department, change their role back to teacher
    if (department.hod && !department.hod.equals(teacher._id)) {
      const currentHod = await teacherModel.findById(department.hod);
      if (currentHod) {
        await userModel.findOneAndUpdate({ originalId: currentHod.teacherId }, { role: 'teacher' });
      }
    }

    // Update department HOD
    department.hod = teacher._id;
    await department.save();

    // Update user role to hod
    await userModel.findOneAndUpdate({ originalId: teacherId }, { role: 'hod' });

    res.status(200).json({ message: "HOD assigned successfully", department });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Check if department exists
    const department = await departmentModel.findOne({ departmentId });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check if department has teachers
    const teachersInDept = await teacherModel.find({ department: department._id });
    if (teachersInDept.length > 0) {
      return res.status(400).json({ message: "Cannot delete department with teachers. Remove all teachers first." });
    }

    // Check if department has students
    const studentsInDept = await studentModel.find({ department: department._id });
    if (studentsInDept.length > 0) {
      return res.status(400).json({ message: "Cannot delete department with students. Remove all students first." });
    }

    // If department has an HOD, change their role back to teacher
    if (department.hod) {
      const hodTeacher = await teacherModel.findById(department.hod);
      if (hodTeacher) {
        await userModel.findOneAndUpdate({ originalId: hodTeacher.teacherId }, { role: 'teacher' });
      }
    }

    await departmentModel.findOneAndDelete({ departmentId });
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Teacher Management
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await teacherModel.find().sort({ name: 1 });
    res.status(200).json(teachers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addTeacher = async (req, res) => {
  try {
    const { teacherId, name, department, specialization } = req.body;

    if (!teacherId || !name || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if teacher already exists
    const existingTeacher = await teacherModel.findOne({ teacherId });
    if (existingTeacher) {
      return res.status(400).json({ message: "Teacher with this ID already exists" });
    }

    const teacher = new teacherModel({
      teacherId,
      name,
      department,
      specialization
    });

    await teacher.save();

    // Create user account for teacher
    const user = new userModel({
      userId: teacherId,
      name,
      email: `${teacherId.toLowerCase()}@rgukt.ac.in`,
      password: await bcrypt.hash('12345678', 10),
      role: 'teacher',
      originalId: teacherId // Store original ID for lookups
    });

    await user.save();

    res.status(201).json({ message: "Teacher added successfully", teacher });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const updates = req.body;

    const teacher = await teacherModel.findOneAndUpdate(
      { teacherId },
      updates,
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json({ message: "Teacher updated successfully", teacher });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Check if teacher has active classes
    const activeClasses = await permanentTimetable.find({ teacherId });
    if (activeClasses.length > 0) {
      return res.status(400).json({ message: "Cannot delete teacher with active classes. Remove timetable entries first." });
    }

    await teacherModel.findOneAndDelete({ teacherId });
    await userModel.findOneAndDelete({ originalId: teacherId });

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Student Management
const getAllStudents = async (req, res) => {
  try {
    const students = await studentModel.find().sort({ rollNumber: 1 });
    res.status(200).json(students);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addStudent = async (req, res) => {
  try {
    const { studentId, rollNumber, name, classYear, branch, section } = req.body;

    if (!studentId || !rollNumber || !name || !classYear || !branch || !section) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if student already exists
    const existingStudent = await studentModel.findOne({ $or: [{ studentId }, { rollNumber }] });
    if (existingStudent) {
      return res.status(400).json({ message: "Student with this ID or roll number already exists" });
    }

    const student = new studentModel({
      studentId,
      rollNumber,
      name,
      classYear,
      branch,
      section
    });

    await student.save();

    // Create user account for student
    const user = new userModel({
      userId: studentId.toLowerCase(),
      name,
      email: `${studentId.toLowerCase()}@rgukt.ac.in`,
      password: await bcrypt.hash('12345678', 10),
      role: 'student',
      originalId: studentId // Store original ID for lookups
    });

    await user.save();

    res.status(201).json({ message: "Student added successfully", student });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const updates = req.body;

    const student = await studentModel.findOneAndUpdate(
      { studentId },
      updates,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student updated successfully", student });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    await studentModel.findOneAndDelete({ studentId });
    await userModel.findOneAndDelete({ originalId: studentId });

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Timetable Management
const getTimetable = async (req, res) => {
  try {
    console.log('🔄 Backend: Fetching timetable from database...');
    let timetable;

    if (req.user.role === 'hod') {
      // For HOD, get teachers in their department
      const department = await getHodDepartment(req.user.userId);
      if (!department) {
        return res.status(403).json({ message: "HOD department not found" });
      }
      const teachers = await teacherModel.find({ department: department.departmentId });
      const teacherIds = teachers.map(t => t.teacherId);
      timetable = await permanentTimetable.find({ teacherId: { $in: teacherIds } }).sort({ dayOfWeek: 1, slot: 1 });
    } else {
      // Super Admin sees all
      timetable = await permanentTimetable.find().sort({ dayOfWeek: 1, slot: 1 });
    }

    console.log('✅ Backend: Found', timetable.length, 'timetable entries');
    console.log('📋 Backend: Timetable data:', timetable);
    res.status(200).json(timetable);
  } catch (err) {
    console.log('❌ Backend: Error fetching timetable:', err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addTimetableEntry = async (req, res) => {
  try {
    const { classId, subject, teacherId, dayOfWeek, slot, startTime, endTime, room } = req.body;

    if (!classId || !subject || !teacherId || !dayOfWeek || !slot) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Check if teacher exists
    const teacher = await teacherModel.findOne({ teacherId });
    if (!teacher) {
      return res.status(400).json({ message: "Teacher not found" });
    }

    // For HOD, check if teacher is in their department
    if (req.user.role === 'hod') {
      const department = await getHodDepartment(req.user.userId);
      if (!department || !teacher.department.equals(department._id)) {
        return res.status(403).json({ message: "Cannot add timetable for teacher outside your department" });
      }
    }

    // Check for conflicts
    const conflict = await permanentTimetable.findOne({
      teacherId,
      dayOfWeek,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } }
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: "Teacher has a scheduling conflict" });
    }

    const timetableId = `${classId}-${teacherId}-${dayOfWeek}-${slot}`;

    const entry = new permanentTimetable({
      timetableId,
      classId,
      subject,
      teacherId,
      dayOfWeek,
      slot,
      startTime,
      endTime,
      room
    });

    await entry.save();
    res.status(201).json({ message: "Timetable entry added successfully", entry });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTimetableEntry = async (req, res) => {
  try {
    const { timetableId } = req.params;
    const updates = req.body;

    // For HOD, check if the entry belongs to their department
    if (req.user.role === 'hod') {
      const entry = await permanentTimetable.findOne({ timetableId });
      if (!entry) {
        return res.status(404).json({ message: "Timetable entry not found" });
      }
      const teacher = await teacherModel.findOne({ teacherId: entry.teacherId });
      const department = await getHodDepartment(req.user.userId);
      if (!department || !teacher.department.equals(department._id)) {
        return res.status(403).json({ message: "Cannot update timetable for teacher outside your department" });
      }
    }

    const entry = await permanentTimetable.findOneAndUpdate(
      { timetableId },
      updates,
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: "Timetable entry not found" });
    }

    res.status(200).json({ message: "Timetable entry updated successfully", entry });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTimetableEntry = async (req, res) => {
  try {
    const { timetableId } = req.params;

    // For HOD, check if the entry belongs to their department
    if (req.user.role === 'hod') {
      const entry = await permanentTimetable.findOne({ timetableId });
      if (!entry) {
        return res.status(404).json({ message: "Timetable entry not found" });
      }
      const teacher = await teacherModel.findOne({ teacherId: entry.teacherId });
      const department = await getHodDepartment(req.user.userId);
      if (!department || !teacher.department.equals(department._id)) {
        return res.status(403).json({ message: "Cannot delete timetable for teacher outside your department" });
      }
    }

    await permanentTimetable.findOneAndDelete({ timetableId });
    res.status(200).json({ message: "Timetable entry deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Auto Generate Timetable
const generateTimetable = async (req, res) => {
  try {
    const { subjects, teachers, weeklyHours } = req.body;

    // This is a simplified auto-generation algorithm
    // In a real implementation, this would be much more complex

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const slots = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const generatedEntries = [];

    let deleteQuery = {};
    if (req.user.role === 'hod') {
      // For HOD, only clear and generate for their department
      const department = await getHodDepartment(req.user.userId);
      if (!department) {
        return res.status(403).json({ message: "HOD department not found" });
      }
      const deptTeachers = await teacherModel.find({ department: department._id });
      const teacherIds = deptTeachers.map(t => t.teacherId);
      deleteQuery = { teacherId: { $in: teacherIds } };
    }

    // Clear existing timetable
    await permanentTimetable.deleteMany(deleteQuery);

    let entryCount = 0;

    for (const subject of subjects) {
      const teacher = teachers.find(t => t.subjects.includes(subject.name));
      if (!teacher) continue;

      // For HOD, ensure teacher is in their department
      if (req.user.role === 'hod') {
        const department = await getHodDepartment(req.user.userId);
        const teacherDoc = await teacherModel.findOne({ teacherId: teacher.teacherId, department: department._id });
        if (!teacherDoc) continue; // Skip if teacher not in department
      }

      let hoursAssigned = 0;

      while (hoursAssigned < subject.weeklyHours && entryCount < 200) { // Prevent infinite loop
        const day = days[Math.floor(Math.random() * days.length)];
        const slot = slots[Math.floor(Math.random() * slots.length)];

        // Check for conflicts
        const conflict = await permanentTimetable.findOne({
          teacherId: teacher.teacherId,
          dayOfWeek: day,
          slot: slot
        });

        if (!conflict) {
          const timetableId = `${subject.classId}-${teacher.teacherId}-${day}-${slot}`;

          const entry = new permanentTimetable({
            timetableId,
            classId: subject.classId,
            subject: subject.name,
            teacherId: teacher.teacherId,
            dayOfWeek: day,
            slot: slot,
            startTime: getStartTime(slot),
            endTime: getEndTime(slot),
            room: `Room ${Math.floor(Math.random() * 50) + 1}`
          });

          await entry.save();
          generatedEntries.push(entry);
          hoursAssigned++;
          entryCount++;
        }
      }
    }

    res.status(200).json({
      message: "Timetable generated successfully",
      entries: generatedEntries.length
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper functions for time calculation
const getStartTime = (slot) => {
  const times = {
    '1': '09:00', '2': '10:00', '3': '11:00', '4': '12:00',
    '5': '14:00', '6': '15:00', '7': '16:00', '8': '17:00'
  };
  return times[slot] || '09:00';
};

const getEndTime = (slot) => {
  const times = {
    '1': '10:00', '2': '11:00', '3': '12:00', '4': '13:00',
    '5': '15:00', '6': '16:00', '7': '17:00', '8': '18:00'
  };
  return times[slot] || '10:00';
};

// Complaints/Queries Management
const getAllQueries = async (req, res) => {
  try {
    const queries = await queryModel.find()
      .populate('studentId', 'name rollNumber section')
      .sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateQueryStatus = async (req, res) => {
  try {
    const { queryId } = req.params;
    const { status, adminResponse, priority } = req.body;

    const updateData = {
      status,
      priority,
      resolvedBy: req.user.userId,
      resolvedAt: new Date()
    };

    if (adminResponse) {
      updateData.adminResponse = adminResponse;
    }

    const query = await queryModel.findOneAndUpdate(
      { queryId },
      updateData,
      { new: true }
    );

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    res.status(200).json({ message: "Query updated successfully", query });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reports
const getSubstitutionHistory = async (req, res) => {
  try {
    const history = await substituteRequests.find()
      .populate('originalTeacherId', 'name')
      .populate('acceptedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getClassStatusSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const summary = await classStatusModel.aggregate([
      { $match: { date: targetDate } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(summary);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  // Departments
  getAllDepartments,
  addDepartment,
  assignHOD,
  deleteDepartment,

  // Teachers
  getAllTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,

  // Students
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,

  // Timetable
  getTimetable,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  generateTimetable,

  // Queries
  getAllQueries,
  updateQueryStatus,

  // Reports
  getSubstitutionHistory,
  getClassStatusSummary
};