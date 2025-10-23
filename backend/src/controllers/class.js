const express = require('express');
const permanentTimetable = require('../models/permanentTimetable');
const studentModel = require('../models/students');
const teacherModel = require('../models/teachers');
const departmentModel = require('../models/departments');
const classStatusModel = require('../models/classStatus');
const userModel = require('../models/user');
const queryModel = require('../models/queries');
const { sendTeacherAbsenceNotification, sendClassStatusUpdateNotification, sendClassStatusUpdateNotificationToStudents } = require('../lib/emailService');

// Fetch class schedule with real-time status
const fetchSchedule = async (req, res) => {
  let { userId, role, date } = req.query;
  try {
    if (!date) {
      date = new Date().toLocaleDateString("en-CA");
    }
    console.log("fecthing class schedule");
    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.toLocaleString("en-US", { weekday: "short" });
    // const dayOfWeek='Mon';

    let query = { dayOfWeek };
    let classId=null;
    if (role == 'student') {
      const student = await studentModel.findOne({ studentId: userId });
      console.log("student",student);
      if (!student) {
        return res.status(400).json({ message: "Student not found" });
      }
      query.classId = student.section;
      classId=student.section;
    } else if (role == 'teacher' || role == 'hod') {
      // For teachers and HODs, show their own classes
      query.teacherId = userId;
    }
    // Get permanent timetable
    let slots = await permanentTimetable.find(query);
    console.log(slots);

    // // Get teacher details for each slot
    const enrichedSlots = await Promise.all(slots.map(async (slot) => {
      console.log("finding teacher");
      const teacher = await teacherModel.findOne({ teacherId: slot.teacherId });
      console.log("enriched");
      // Check for class status updates for this specific date
      const statusUpdate = await classStatusModel.findOne({
        classId: role === 'student' ? classId : slot.classId,
        teacherId: slot.teacherId,
        date: new Date(date),
        subject: slot.subject,
        startTime: slot.startTime
      });
      console.log("update");
      return {
        classId: slot.classId,
        subject: slot.subject,
        teacherId: slot.teacherId,
        teacherName: teacher ? teacher.name : 'Unknown Teacher',
        dayOfWeek: slot.dayOfWeek,
        slot: slot.slot,
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: slot.room,
        date: date,
        // Status information
        status: statusUpdate ? statusUpdate.status : 'engaged',
        delayMinutes: statusUpdate ? statusUpdate.delayMinutes : 0,
        substituteTeacherId: statusUpdate ? statusUpdate.substituteTeacherId : null,
        substituteTeacherName: statusUpdate ? statusUpdate.substituteTeacherName : null,
        studentMarkedAbsent: statusUpdate ? statusUpdate.studentMarkedAbsent : false,
        remarks: statusUpdate ? statusUpdate.remarks : null,
        updatedBy: statusUpdate ? statusUpdate.updatedBy : null,
        lastUpdated: statusUpdate ? statusUpdate.updatedAt : null
      };
    }));
    console.log(enrichedSlots);
    res.status(200).json( enrichedSlots);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update class status (Teacher functionality)
const updateClassStatus = async (req, res) => {
  try {
    const { classId, teacherId, date, subject, startTime, status, delayMinutes, substituteTeacherId, remarks } = req.body;
    const updatedBy = req.user.userId;

    if (!classId || !teacherId || !date || !subject || !startTime || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate status
    const validStatuses = ['engaged', 'not_taking', 'delayed', 'absent', 'assigning_substitute'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Get substitute teacher name if provided
    let substituteTeacherName = null;
    if (substituteTeacherId) {
      const substituteTeacher = await teacherModel.findOne({ teacherId: substituteTeacherId });
      substituteTeacherName = substituteTeacher ? substituteTeacher.name : null;
    }

    // Get period number from permanent timetable
    const timetableEntry = await permanentTimetable.findOne({
      classId,
      teacherId,
      subject,
      startTime
    });

    // Parse period number safely
    let periodNo = 1; // Default fallback
    if (timetableEntry && timetableEntry.slot) {
      const parsed = parseInt(timetableEntry.slot);
      if (!isNaN(parsed) && parsed > 0) {
        periodNo = parsed;
      }
    }

    // Create or update class status
    const statusData = {
      statusId: `${classId}-${teacherId}-${date}-${startTime}`,
      classId,
      teacherId,
      date: new Date(date),
      periodNo,
      subject,
      startTime,
      endTime: timetableEntry ? timetableEntry.endTime : null,
      room: timetableEntry ? timetableEntry.room : null,
      status,
      delayMinutes: delayMinutes || 0,
      substituteTeacherId,
      substituteTeacherName,
      remarks,
      updatedBy
    };

    const existingStatus = await classStatusModel.findOne({
      classId,
      teacherId,
      date: new Date(date),
      subject,
      startTime
    });

    let classStatus;
    if (existingStatus) {
      classStatus = await classStatusModel.findByIdAndUpdate(existingStatus._id, statusData, { new: true });
    } else {
      classStatus = new classStatusModel(statusData);
      await classStatus.save();
    }

    // No student email notifications - teachers handle communication through the system

    res.status(200).json({ 
      message: "Class status updated successfully", 
      classStatus 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Mark teacher as absent (Student functionality)
const markTeacherAbsent = async (req, res) => {
  try {
    const { classId, teacherId, date, subject, startTime, endTime, room } = req.body;
    const studentId = req.user.userId;

    if (!classId || !teacherId || !date || !subject || !startTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if student belongs to this class
    const student = await studentModel.findOne({ studentId, section: classId });
    if (!student) {
      return res.status(403).json({ message: "You are not authorized to report for this class" });
    }

    // Check if already reported
    const existingStatus = await classStatusModel.findOne({
      classId,
      teacherId,
      date: new Date(date),
      subject,
      startTime,
      studentMarkedAbsent: true
    });

    if (existingStatus) {
      return res.status(400).json({ message: "Teacher absence already reported for this class" });
    }

    // Set grace period (30 minutes from now)
    const graceTimeExpiry = new Date();
    graceTimeExpiry.setMinutes(graceTimeExpiry.getMinutes() + 30);

    // Get period number from permanent timetable
    const timetableEntry = await permanentTimetable.findOne({
      classId,
      teacherId,
      subject,
      startTime
    });

    // Parse period number safely
    let periodNo = 1; // Default fallback
    if (timetableEntry && timetableEntry.slot) {
      const parsed = parseInt(timetableEntry.slot);
      if (!isNaN(parsed) && parsed > 0) {
        periodNo = parsed;
      }
    }

    // Create class status with student report
    const statusData = {
      statusId: `${classId}-${teacherId}-${date}-${startTime}`,
      classId,
      teacherId,
      date: new Date(date),
      periodNo,
      subject,
      startTime,
      endTime,
      room,
      status: 'engaged', // Initially keep as engaged, will change to absent if teacher doesn't respond
      studentMarkedAbsent: true,
      studentReporterId: studentId,
      teacherNotified: false,
      graceTimeExpiry,
      remarks: `Absence reported by student ${student.name}`,
      updatedBy: studentId
    };

    const classStatus = new classStatusModel(statusData);
    await classStatus.save();

    // Get teacher details and send notification
    const teacher = await teacherModel.findOne({ teacherId });
    const teacherUser = await userModel.findOne({ userId: teacherId });
    
    if (teacher && teacherUser) {
      const notificationSent = await sendTeacherAbsenceNotification(
        teacherUser.email,
        teacher.name,
        {
          subject,
          date,
          startTime,
          endTime,
          room
        },
        student.name,
        graceTimeExpiry
      );

      if (notificationSent) {
        await classStatusModel.findByIdAndUpdate(classStatus._id, { teacherNotified: true });
      }
    }

    res.status(200).json({ 
      message: "Teacher absence reported successfully. Notification sent to teacher.",
      graceTimeExpiry 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Teacher response to absence report
const respondToAbsenceReport = async (req, res) => {
  try {
    const { classId, date, subject, startTime, response, actualStatus } = req.body;
    const teacherId = req.user.userId;

    if (!classId || !date || !subject || !startTime || !response) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const classStatus = await classStatusModel.findOne({
      classId,
      teacherId,
      date: new Date(date),
      subject,
      startTime,
      studentMarkedAbsent: true
    });

    if (!classStatus) {
      return res.status(404).json({ message: "Absence report not found" });
    }

    // Check if grace period has expired
    if (new Date() > classStatus.graceTimeExpiry) {
      return res.status(400).json({ message: "Grace period has expired" });
    }

    // Update status based on teacher response
    const updateData = {
      teacherResponse: response,
      status: actualStatus || 'engaged',
      updatedBy: teacherId
    };

    await classStatusModel.findByIdAndUpdate(classStatus._id, updateData);

    res.status(200).json({ message: "Response recorded successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Submit query/complaint (Student functionality)
const submitQuery = async (req, res) => {
  try {
    const { teacherId, subject, message, category } = req.body;
    const studentId = req.user.userId;

    if (!message || !category) {
      return res.status(400).json({ message: "Message and category are required" });
    }

    const queryData = {
      queryId: `query-${Date.now()}-${studentId}`,
      studentId,
      teacherId,
      subject,
      message,
      category,
      status: 'open'
    };

    const query = new queryModel(queryData);
    await query.save();

    res.status(200).json({ 
      message: "Query submitted successfully. Admin will review and respond.",
      queryId: query.queryId 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get student queries
const getStudentQueries = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const queries = await queryModel.find({ studentId }).sort({ createdAt: -1 });
    
    res.status(200).json(queries);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Background job to handle expired grace periods
const handleExpiredGracePeriods = async () => {
  try {
    const expiredReports = await classStatusModel.find({
      studentMarkedAbsent: true,
      status: 'engaged',
      graceTimeExpiry: { $lt: new Date() },
      teacherResponse: { $exists: false }
    });

    for (const report of expiredReports) {
      await classStatusModel.findByIdAndUpdate(report._id, {
        status: 'absent',
        remarks: `${report.remarks} - Grace period expired, marked as absent`
      });

      // No student email notifications - status updates are handled through the system
    }

    console.log(`Processed ${expiredReports.length} expired grace periods`);
  } catch (err) {
    console.error('Error handling expired grace periods:', err);
  }
};

// Manual assignment of substitute teacher
const assignSubstituteTeacher = async (req, res) => {
  try {
    const { classId, teacherId, date, subject, startTime, endTime, room, substituteTeacherId, remarks } = req.body;
    const assignerId = req.user.userId;

    if (!classId || !teacherId || !date || !subject || !startTime || !substituteTeacherId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if substitute teacher exists
    const substituteTeacher = await teacherModel.findOne({ teacherId: substituteTeacherId });
    if (!substituteTeacher) {
      return res.status(404).json({ message: "Substitute teacher not found" });
    }

    // Get period number from permanent timetable
    const timetableEntry = await permanentTimetable.findOne({
      classId,
      teacherId,
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
    const statusData = {
      statusId: `${classId}-${teacherId}-${date}-${startTime}`,
      classId,
      teacherId,
      date: new Date(date),
      periodNo,
      subject,
      startTime,
      endTime: timetableEntry ? timetableEntry.endTime : endTime,
      room: timetableEntry ? timetableEntry.room : room,
      status: 'engaged',
      substituteTeacherId,
      substituteTeacherName: substituteTeacher.name,
      remarks: remarks || '',
      updatedBy: assignerId
    };

    const existingStatus = await classStatusModel.findOne({
      classId,
      teacherId,
      date: new Date(date),
      subject,
      startTime
    });

    let classStatus;
    if (existingStatus) {
      classStatus = await classStatusModel.findByIdAndUpdate(existingStatus._id, statusData, { new: true });
    } else {
      classStatus = new classStatusModel(statusData);
      await classStatus.save();
    }

    // Send notification to the assigned substitute teacher
    const substituteUser = await userModel.findOne({ userId: substituteTeacherId });
    if (substituteUser && substituteUser.email) {
      const assigner = await userModel.findOne({ userId: assignerId });
      const assignerName = assigner ? assigner.name : 'Administrator';

      await sendClassStatusUpdateNotification(
        substituteUser.email,
        {
          subject,
          classId,
          date,
          startTime,
          endTime,
          room,
          assignmentType: 'manual_substitute'
        },
        'manual_substitute',
        assignerName
      );
    }

    res.status(200).json({
      message: "Substitute teacher assigned successfully",
      classStatus
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Run grace period check every 5 minutes
setInterval(handleExpiredGracePeriods, 5 * 60 * 1000);

module.exports = {
  fetchSchedule,
  updateClassStatus,
  markTeacherAbsent,
  respondToAbsenceReport,
  submitQuery,
  getStudentQueries,
  assignSubstituteTeacher
};