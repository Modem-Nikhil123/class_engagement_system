const express = require('express');
const {
  fetchSchedule,
  updateClassStatus,
  markTeacherAbsent,
  respondToAbsenceReport,
  submitQuery,
  getStudentQueries,
  assignSubstituteTeacher
} = require('../controllers/class');
const { protectRoute } = require('../controllers/auth');
const router = express.Router();

// Get class schedule with status
router.get('/schedule', protectRoute, fetchSchedule);

// Teacher routes
router.post('/update-status', protectRoute, updateClassStatus);
router.post('/respond-absence', protectRoute, respondToAbsenceReport);
router.post('/assign-substitute', protectRoute, assignSubstituteTeacher);

// Student routes
router.post('/mark-absent', protectRoute, markTeacherAbsent);
router.post('/submit-query', protectRoute, submitQuery);
router.get('/my-queries', protectRoute, getStudentQueries);

module.exports = router;