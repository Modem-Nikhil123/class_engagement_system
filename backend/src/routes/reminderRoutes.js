const express = require('express');
const {
  createReminder,
  getTeacherReminders,
  updateReminder, 
  deleteReminder,
  toggleReminder
} = require('../controllers/reminderController');
const { protectRoute } = require('../controllers/auth');

const router = express.Router();

// Get teacher's reminders
router.get('/teacher/:teacherId', protectRoute, getTeacherReminders);

// Create reminder
router.post('/', protectRoute, createReminder);

// Update reminder
router.put('/:reminderId', protectRoute, updateReminder);

// Delete reminder
router.delete('/:reminderId', protectRoute, deleteReminder);

// Toggle reminder active status
router.patch('/:reminderId/toggle', protectRoute, toggleReminder);

module.exports = router;