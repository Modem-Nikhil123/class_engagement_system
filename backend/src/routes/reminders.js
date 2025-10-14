const express = require('express');
const router = express.Router();
const { protectRoute } = require('../controllers/auth');
const {
  createReminder,
  getTeacherReminders,
  updateReminder,
  deleteReminder,
  toggleReminder,
  sendScheduledReminders
} = require('../controllers/reminderController');

// Create a new reminder
router.post('/', protectRoute, createReminder);

// Get all reminders for a specific teacher
router.get('/teacher/:teacherId', getTeacherReminders);

// Update an existing reminder
router.put('/:reminderId', protectRoute, updateReminder);

// Delete a reminder
router.delete('/:reminderId', protectRoute, deleteReminder);

// Toggle reminder completion status
router.patch('/:reminderId/toggle', protectRoute, toggleReminder);

// Route to manually trigger sending scheduled reminders
router.get('/send-reminders', async (req, res) => {
  try {
    await sendScheduledReminders();
    res.status(200).json({ message: 'Scheduled reminders sent successfully' });
  } catch (error) {
    console.error('Error triggering sendScheduledReminders:', error);
    res.status(500).json({ message: 'Failed to send scheduled reminders' });
  }
});

module.exports = router;