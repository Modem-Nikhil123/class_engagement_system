const SubstituteRequest = require('../models/substituteRequests');
const permanentTimetable = require('../models/permanentTimetable');
const teacherModel = require('../models/teachers');
const userModel = require('../models/user');
const classStatusModel = require('../models/classStatus');
const { sendSubstituteRequestNotification } = require('../lib/emailService');

// Create substitute request and send notifications
const createSubstituteRequest = async (req, res) => {
  try {
    const { classId, subject, date, startTime, endTime, room } = req.body;
    const originalTeacherId = req.user.userId;

    // Get original teacher name
    const originalTeacher = await teacherModel.findOne({ teacherId: originalTeacherId });
    if (!originalTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Find available teachers for this time slot
    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.toLocaleString("en-US", { weekday: "short" });

    // Get all teachers who have classes at this time slot
    const busyTeachers = await permanentTimetable.find({
      dayOfWeek,
      startTime,
      endTime
    }).distinct('teacherId');

    // Get all teachers except busy ones and the original teacher
    const allTeachers = await teacherModel.find({
      teacherId: { $nin: [...busyTeachers] }
    });

    if (allTeachers.length === 0) {
      return res.status(400).json({ message: "No available teachers found for this time slot" });
    }

    // Create substitute request
    const requestId = `sub-${Date.now()}-${originalTeacherId}`;
    const substituteRequest = new SubstituteRequest({
      requestId,
      originalTeacherId,
      originalTeacherName: originalTeacher.name,
      classId,
      subject,
      date: new Date(date),
      startTime,
      endTime,
      room
    });

    await substituteRequest.save();

    // Get emails of available teachers
    const teacherUserIds = allTeachers.map(teacher => teacher.teacherId);
    const teacherUsers = await userModel.find({ userId: { $in: teacherUserIds } });
    const teacherEmails = teacherUsers.map(user => user.email).filter(email => email);

    // Send notification emails
    if (teacherEmails.length > 0) {
      await sendSubstituteRequestNotification(teacherEmails, originalTeacher.name, {
        subject,
        classId,
        date,
        startTime,
        endTime,
        room
      });
    }

    res.status(201).json({
      message: "Substitute request created and notifications sent",
      request: substituteRequest,
      notifiedTeachers: teacherEmails.length
    });
  } catch (error) {
    console.error('Error creating substitute request:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get substitute requests for a teacher
const getSubstituteRequests = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    // Get pending requests (not created by this teacher and not accepted by others)
    const requests = await SubstituteRequest.find({
      originalTeacherId: { $ne: teacherId },
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching substitute requests:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept substitute request
const acceptSubstituteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const teacherId = req.user.userId;

    // Get the substitute request
    const request = await SubstituteRequest.findOne({ requestId });
    if (!request) {
      return res.status(404).json({ message: "Substitute request not found" });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: "Request is no longer available" });
    }

    // Get accepting teacher details
    const acceptingTeacher = await teacherModel.findOne({ teacherId });
    if (!acceptingTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update request status
    request.status = 'accepted';
    request.acceptedBy = teacherId;
    request.acceptedByName = acceptingTeacher.name;
    await request.save();

    // Get period number from permanent timetable
    const timetableEntry = await permanentTimetable.findOne({
      classId: request.classId,
      teacherId: request.originalTeacherId,
      subject: request.subject,
      startTime: request.startTime
    });

    // Parse period number safely
    let periodNo = 1; // Default fallback
    if (timetableEntry && timetableEntry.slot) {
      const parsed = parseInt(timetableEntry.slot);
      if (!isNaN(parsed) && parsed > 0) {
        periodNo = parsed;
      }
    }

    // Update class status to engaged with substitute teacher
    const statusData = {
      statusId: `${request.classId}-${request.originalTeacherId}-${request.date.toISOString().split('T')[0]}-${request.startTime}`,
      classId: request.classId,
      teacherId: request.originalTeacherId,
      date: request.date,
      periodNo,
      subject: request.subject,
      startTime: request.startTime,
      endTime: request.endTime,
      room: request.room,
      status: 'engaged', // Keep as engaged but with substitute info
      substituteTeacherId: teacherId,
      substituteTeacherName: acceptingTeacher.name,
      remarks: `Substitute: ${acceptingTeacher.name}`,
      updatedBy: request.originalTeacherId
    };

    const existingStatus = await classStatusModel.findOne({
      classId: request.classId,
      teacherId: request.originalTeacherId,
      date: request.date,
      subject: request.subject,
      startTime: request.startTime
    });

    if (existingStatus) {
      await classStatusModel.findByIdAndUpdate(existingStatus._id, statusData, { new: true });
    } else {
      const newStatus = new classStatusModel(statusData);
      await newStatus.save();
    }

    res.status(200).json({
      message: "Substitute request accepted successfully",
      request
    });
  } catch (error) {
    console.error('Error accepting substitute request:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Decline substitute request
const declineSubstituteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const teacherId = req.user.userId;

    const request = await SubstituteRequest.findOne({ requestId });
    if (!request) {
      return res.status(404).json({ message: "Substitute request not found" });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: "Request is no longer available" });
    }

    request.status = 'declined';
    await request.save();

    res.status(200).json({
      message: "Substitute request declined",
      request
    });
  } catch (error) {
    console.error('Error declining substitute request:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get substitute requests created by teacher
const getMySubstituteRequests = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    const requests = await SubstituteRequest.find({
      originalTeacherId: teacherId
    }).sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching my substitute requests:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Manual assignment of substitute teacher
const manualAssignSubstitute = async (req, res) => {
  try {
    const { teacherId, classId, subject, date, startTime, endTime, room } = req.body;
    const assignerId = req.user.userId;

    // Validate required fields
    if (!teacherId || !classId || !subject || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if teacher exists
    const teacher = await teacherModel.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if assigner has permission (admin or HOD)
    const assigner = await userModel.findOne({ userId: assignerId });
    if (!assigner || !['admin', 'hod'].includes(assigner.role)) {
      return res.status(403).json({ message: "Unauthorized: Only admin or HOD can manually assign substitutes" });
    }

    // Check teacher's availability for the time slot
    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.toLocaleString("en-US", { weekday: "short" });

    // Check permanent schedule conflicts
    const permanentConflicts = await permanentTimetable.find({
      teacherId,
      dayOfWeek,
      startTime,
      endTime
    });

    if (permanentConflicts.length > 0) {
      return res.status(400).json({
        message: "Teacher has a permanent class scheduled at this time",
        conflicts: permanentConflicts
      });
    }

    // Check existing assignments on this date
    const existingAssignments = await classStatusModel.find({
      teacherId,
      date: new Date(date),
      startTime,
      endTime,
      status: { $in: ['engaged', 'assigning_substitute'] }
    });

    if (existingAssignments.length > 0) {
      return res.status(400).json({
        message: "Teacher already has an assignment at this time",
        conflicts: existingAssignments
      });
    }

    // Get period number from permanent timetable (if exists for this class)
    const timetableEntry = await permanentTimetable.findOne({
      classId,
      subject,
      startTime
    });

    let periodNo = 1; // Default fallback
    if (timetableEntry && timetableEntry.slot) {
      const parsed = parseInt(timetableEntry.slot);
      if (!isNaN(parsed) && parsed > 0) {
        periodNo = parsed;
      }
    }

    // Create or update class status with substitute assignment
    const statusId = `${classId}-${assignerId}-${date}-${startTime}`;
    const statusData = {
      statusId,
      classId,
      teacherId: assignerId, // Original teacher or admin assigning
      date: new Date(date),
      periodNo,
      subject,
      startTime,
      endTime,
      room: room || '',
      status: 'engaged',
      substituteTeacherId: teacherId,
      substituteTeacherName: teacher.name,
      remarks: `Manual substitute assignment: ${teacher.name}`,
      updatedBy: assignerId
    };

    const existingStatus = await classStatusModel.findOne({
      classId,
      date: new Date(date),
      subject,
      startTime
    });

    let savedStatus;
    if (existingStatus) {
      savedStatus = await classStatusModel.findByIdAndUpdate(existingStatus._id, statusData, { new: true });
    } else {
      const newStatus = new classStatusModel(statusData);
      savedStatus = await newStatus.save();
    }

    // Send notification to the assigned teacher
    const teacherUser = await userModel.findOne({ userId: teacherId });
    if (teacherUser && teacherUser.email) {
      await sendSubstituteRequestNotification([teacherUser.email], assigner.name || 'Administrator', {
        subject,
        classId,
        date,
        startTime,
        endTime,
        room,
        assignmentType: 'manual'
      });
    }

    res.status(201).json({
      message: "Substitute teacher assigned successfully",
      assignment: {
        teacherId: teacher.teacherId,
        teacherName: teacher.name,
        classId,
        subject,
        date,
        startTime,
        endTime,
        room,
        assignedBy: assignerId
      },
      status: savedStatus
    });
  } catch (error) {
    console.error('Error in manual substitute assignment:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createSubstituteRequest,
  getSubstituteRequests,
  acceptSubstituteRequest,
  declineSubstituteRequest,
  getMySubstituteRequests,
  manualAssignSubstitute
};