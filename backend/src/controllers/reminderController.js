const Reminder = require('../models/reminders');
const Teacher = require('../models/teachers'); // Will need teacher email
const User = require('../models/user'); // To get user email
const { sendReminderEmail } = require('../lib/emailService'); // Will implement this function

// Create a new reminder
const createReminder = async (req, res) => {
  try {
    const { title, description, date, time } = req.body;
    const teacherId = req.user?.userId; // Safe access with optional chaining

    // Validate required fields
    if (!teacherId) {
      console.error('No teacherId found in request. User authentication may be missing.');
      return res.status(401).json({ message: 'Authentication required. Please log in again.' });
    }

    // Allow creating reminders with minimal data - provide defaults if needed
    const finalTitle = title || 'Untitled Reminder';
    const finalDate = date || new Date().toLocaleDateString('en-CA');
    const finalTime = time || '09:00';

    console.log("Creating reminder for teacherId:", teacherId);

    const newReminder = new Reminder({
      teacherId,
      title: finalTitle,
      description,
      date: finalDate,
      time: finalTime,
    });

    await newReminder.save();
    console.log("created remainder")
    

    // Send confirmation email immediately upon creation
    const teacher = await Teacher.findOne({ teacherId });
    const user = await User.findOne({ userId: teacherId });
    if (teacher && user && user.email) {
      console.log("Sending confirmation email for new reminder");
      try {
        await sendReminderEmail(user.email, teacher.name, newReminder);
        console.log("Confirmation email sent successfully");
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    }

    // Check if reminder is due soon (within 1 hour) and send immediate reminder
    const reminderDateTime = new Date(`${finalDate}T${finalTime}:00`);
    const timeUntilReminder = reminderDateTime.getTime() - new Date().getTime();
    if (timeUntilReminder > 0 && timeUntilReminder <= 60 * 60 * 1000) { // Within 1 hour
      if (teacher && user && user.email) {
        console.log("Sending immediate reminder email (due within 1 hour)");
        try {
          await sendReminderEmail(user.email, teacher.name, newReminder);
          newReminder.isEmailSent = true;
          await newReminder.save();
        } catch (emailError) {
          console.error("Failed to send immediate reminder email:", emailError);
        }
      }
    }

    res.status(201).json({ message: 'Reminder created successfully', reminder: newReminder });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all reminders for a specific teacher
const getTeacherReminders = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const reminders = await Reminder.find({ teacherId }).sort({ date: 1, time: 1 });
    res.status(200).json(reminders || []);
  } catch (error) {
    console.error('Error fetching teacher reminders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update an existing reminder
const updateReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { title, description, date, time, isCompleted } = req.body;
    const teacherId = req.user?.userId;

    if (!teacherId) {
      console.error('No teacherId found in request for update operation');
      return res.status(401).json({ message: 'Authentication required. Please log in again.' });
    }

    // Provide defaults for empty fields
    const updateData = {
      isEmailSent: false, // Reset email sent status on update
    };

    if (title !== undefined) updateData.title = title || 'Untitled Reminder';
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date || new Date().toLocaleDateString('en-CA');
    if (time !== undefined) updateData.time = time || '09:00';
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    const updatedReminder = await Reminder.findOneAndUpdate(
      { _id: reminderId, teacherId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedReminder) {
      return res.status(404).json({ message: 'Reminder not found or unauthorized' });
    }

    res.status(200).json({ message: 'Reminder updated successfully', reminder: updatedReminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a reminder
const deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const teacherId = req.user?.userId;

    if (!teacherId) {
      console.error('No teacherId found in request for delete operation');
      return res.status(401).json({ message: 'Authentication required. Please log in again.' });
    }

    const deletedReminder = await Reminder.findOneAndDelete({ _id: reminderId, teacherId });

    if (!deletedReminder) {
      return res.status(404).json({ message: 'Reminder not found or unauthorized' });
    }

    res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle reminder completion status
const toggleReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const teacherId = req.user?.userId;

    if (!teacherId) {
      console.error('No teacherId found in request for toggle operation');
      return res.status(401).json({ message: 'Authentication required. Please log in again.' });
    }

    const reminder = await Reminder.findOne({ _id: reminderId, teacherId });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found or unauthorized' });
    }

    reminder.isCompleted = !reminder.isCompleted;
    await reminder.save();

    res.status(200).json({ message: 'Reminder status toggled successfully', reminder });
  } catch (error) {
    console.error('Error toggling reminder status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Background job to send reminder emails
const sendScheduledReminders = async () => {
  try {
    console.log('Running scheduled reminder check...');
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // Check for reminders within 1 hour

    const upcomingReminders = await Reminder.find({
      date: { $lte: oneHourFromNow },
      isCompleted: false,
      isEmailSent: false,
    });

    console.log(`Found ${upcomingReminders.length} upcoming reminders to check`);

    for (const reminder of upcomingReminders) {
      try {
        const reminderDateTime = new Date(`${reminder.date.toLocaleDateString('en-CA')}T${reminder.time}:00`);
        const timeUntilReminder = reminderDateTime.getTime() - now.getTime();

        // Send email if reminder is within 30 minutes
        if (timeUntilReminder > 0 && timeUntilReminder <= 30 * 60 * 1000) {
          const teacher = await Teacher.findOne({ teacherId: reminder.teacherId });
          const user = await User.findOne({ userId: reminder.teacherId });

          if (teacher && user && user.email) {
            console.log(`Sending scheduled reminder email for: ${reminder.title} to ${user.email}`);
            const emailSent = await sendReminderEmail(user.email, teacher.name, reminder);
            if (emailSent) {
              reminder.isEmailSent = true;
              await reminder.save();
              console.log(`Successfully sent reminder email for: ${reminder.title}`);
            } else {
              console.error(`Failed to send reminder email for: ${reminder.title}`);
            }
          } else {
            console.warn(`Missing teacher or user data for reminder: ${reminder.title}`);
          }
        }
      } catch (reminderError) {
        console.error(`Error processing reminder ${reminder.title}:`, reminderError);
      }
    }
  } catch (error) {
    console.error('Error in sendScheduledReminders background job:', error);
  }
};

// Run the background job every 2 minutes for more responsive reminders
setInterval(sendScheduledReminders, 2 * 60 * 1000);

// Also run immediately when the server starts
setTimeout(sendScheduledReminders, 10000); // Run 10 seconds after server start


module.exports = {
  createReminder,
  getTeacherReminders,
  updateReminder,
  deleteReminder,
  toggleReminder,
  sendScheduledReminders,
};
