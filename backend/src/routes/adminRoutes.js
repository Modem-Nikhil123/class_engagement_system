const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../lib/token');

// Apply authentication middleware
router.use(authenticateToken);

// Super Admin only routes
router.use('/departments', requireRole('super_admin'));
router.get('/departments', adminController.getAllDepartments);
router.post('/departments', adminController.addDepartment);
router.post('/departments/assign-hod', adminController.assignHOD);
router.delete('/departments/:departmentId', adminController.deleteDepartment);

router.get('/teachers', requireRole(['super_admin', 'hod']), adminController.getAllTeachers);
router.post('/teachers', requireRole('super_admin'), adminController.addTeacher);
router.put('/teachers/:teacherId', requireRole('super_admin'), adminController.updateTeacher);
router.delete('/teachers/:teacherId', requireRole('super_admin'), adminController.deleteTeacher);

router.get('/students', requireRole(['super_admin', 'hod']), adminController.getAllStudents);
router.post('/students', requireRole('super_admin'), adminController.addStudent);
router.put('/students/:studentId', requireRole('super_admin'), adminController.updateStudent);
router.delete('/students/:studentId', requireRole('super_admin'), adminController.deleteStudent);

// HOD and Super Admin routes
router.use('/timetable', requireRole(['super_admin', 'hod']));
router.get('/timetable', adminController.getTimetable);
router.post('/timetable', adminController.addTimetableEntry);
router.put('/timetable/:timetableId', adminController.updateTimetableEntry);
router.delete('/timetable/:timetableId', adminController.deleteTimetableEntry);
router.post('/timetable/generate', adminController.generateTimetable);

// Query/Complaints Management Routes (HOD and Super Admin)
router.use('/queries', requireRole(['super_admin', 'hod']));
router.get('/queries', adminController.getAllQueries);
router.put('/queries/:queryId', adminController.updateQueryStatus);

// Reports Routes (Super Admin only)
router.use('/reports', requireRole('super_admin'));
router.get('/reports/substitution-history', adminController.getSubstitutionHistory);
router.get('/reports/class-status-summary', adminController.getClassStatusSummary);

module.exports = router;