const teacherModel = require('../models/teachers');
const permanentTimetable = require('../models/permanentTimetable');
const classStatusModel = require('../models/classStatus');
const userModel = require('../models/user');
const { sendSubstituteRequestNotification } = require('../lib/emailService');

// Search teachers by name/department with availability filter
const searchTeachers = async (req, res) => {
  try {
    const { query, department, date, startTime, endTime } = req.query;

    let searchCriteria = {};

    // Add text search for name or department
    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } }
      ];
    }

    // Filter by department if specified
    if (department) {
      searchCriteria.department = { $regex: department, $options: 'i' };
    }

    // Get all teachers matching search criteria
    const teachers = await teacherModel.find(searchCriteria);

    let availableTeachers = teachers;

    // If date and time are provided, filter by availability
    if (date && startTime && endTime) {
      const [year, month, day] = date.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);
      const dayOfWeek = localDate.toLocaleString("en-US", { weekday: "short" });

      // Find teachers who have classes at this time slot
      const busyTeachers = await permanentTimetable.find({
        dayOfWeek,
        startTime,
        endTime
      }).distinct('teacherId');

      // Check for existing assignments on this date that overlap with the requested time
      const existingStatuses = await classStatusModel.find({
        date: new Date(date),
        status: { $in: ['engaged', 'assigning_substitute'] }
      });
  
      // Filter for overlapping assignments
      const overlappingStatuses = existingStatuses.filter(status => {
        return (status.startTime < endTime && status.endTime > startTime);
      });
  
      // Get teacher IDs from overlapping assignments (both original teachers and substitute teachers)
      const overlappingTeacherIds = overlappingStatuses.map(status => status.teacherId);
      const overlappingSubstituteIds = overlappingStatuses
        .map(status => status.substituteTeacherId)
        .filter(id => id); // Filter out null/undefined
  
      const allBusyTeacherIds = [...busyTeachers, ...overlappingTeacherIds, ...overlappingSubstituteIds];

      // Filter out busy teachers
      availableTeachers = teachers.filter(teacher =>
        !allBusyTeacherIds.includes(teacher.teacherId)
      );
    }

    // Get user emails for notification purposes
    const teacherUserIds = availableTeachers.map(teacher => teacher.teacherId);
    const teacherUsers = await userModel.find({ userId: { $in: teacherUserIds } });

    const teachersWithEmails = availableTeachers.map(teacher => {
      const user = teacherUsers.find(u => u.userId === teacher.teacherId);
      return {
        teacherId: teacher.teacherId,
        name: teacher.name,
        department: teacher.department,
        specialization: teacher.specialization,
        email: user ? user.email : null
      };
    });

    res.status(200).json({
      teachers: teachersWithEmails,
      total: teachersWithEmails.length
    });
  } catch (error) {
    console.error('Error searching teachers:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get teacher's weekly schedule with conflict detection
const getTeacherSchedule = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { requestedDate, requestedStartTime, requestedEndTime } = req.query;

    // Get teacher's permanent timetable
    const timetable = await permanentTimetable.find({ teacherId });

    // Group by day of week
    const scheduleByDay = {};
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    daysOfWeek.forEach(day => {
      scheduleByDay[day] = [];
    });

    timetable.forEach(entry => {
      if (scheduleByDay[entry.dayOfWeek]) {
        scheduleByDay[entry.dayOfWeek].push({
          classId: entry.classId,
          subject: entry.subject,
          slot: entry.slot,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room
        });
      }
    });

    // Sort slots by start time for each day
    Object.keys(scheduleByDay).forEach(day => {
      scheduleByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    let conflicts = [];

    // Check for conflicts if date and time are provided
    if (requestedDate && requestedStartTime && requestedEndTime) {
      const [year, month, day] = requestedDate.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);
      const dayOfWeek = localDate.toLocaleString("en-US", { weekday: "short" });

      // Check permanent schedule conflicts
      const permanentConflicts = scheduleByDay[dayOfWeek] || [];
      const timeConflicts = permanentConflicts.filter(slot => {
        return (slot.startTime < requestedEndTime && slot.endTime > requestedStartTime);
      });

      // Check existing class status for the date (both as original teacher and substitute teacher)
      const existingStatuses = await classStatusModel.find({
        $or: [
          { teacherId, date: new Date(requestedDate) },
          { substituteTeacherId: teacherId, date: new Date(requestedDate) }
        ],
        status: { $in: ['engaged', 'assigning_substitute'] }
      });

      const statusConflicts = existingStatuses.filter(status => {
        return (status.startTime < requestedEndTime && status.endTime > requestedStartTime);
      });

      conflicts = [
        ...timeConflicts.map(conflict => ({
          type: 'permanent_schedule',
          classId: conflict.classId,
          subject: conflict.subject,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          room: conflict.room
        })),
        ...statusConflicts.map(conflict => ({
          type: 'existing_assignment',
          classId: conflict.classId,
          subject: conflict.subject,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          room: conflict.room,
          status: conflict.status
        }))
      ];
    }

    res.status(200).json({
      teacherId,
      schedule: scheduleByDay,
      conflicts: conflicts,
      isAvailable: conflicts.length === 0
    });
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  searchTeachers,
  getTeacherSchedule
};