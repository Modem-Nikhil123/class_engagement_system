const express = require('express');
const router = express.Router();
const {
  searchTeachers,
  getTeacherSchedule
} = require('../controllers/teacherController');
const { protectRoute } = require('../controllers/auth');

// Search teachers by name/department with optional availability filter
router.get('/search', protectRoute, searchTeachers);

// Get teacher's weekly schedule with conflict detection
router.get('/:teacherId/schedule', protectRoute, getTeacherSchedule);

module.exports = router;