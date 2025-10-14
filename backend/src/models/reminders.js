const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String, // e.g., "14:30"
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  isEmailSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Drop the old index if it exists
reminderSchema.pre('save', async function(next) {
  try {
    const collection = this.constructor.collection;
    const indexes = await collection.indexes();

    // Check if reminderId index exists and drop it
    const reminderIdIndex = indexes.find(index => index.name === 'reminderId_1');
    if (reminderIdIndex) {
      console.log('Dropping old reminderId index...');
      await collection.dropIndex('reminderId_1');
      console.log('Old reminderId index dropped successfully');
    }
  } catch (error) {
    // Ignore errors if index doesn't exist or other issues
    if (error.code !== 27 && error.code !== 11000) { // 27 = index not found, 11000 = duplicate key
      console.error('Error dropping old index:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Reminder', reminderSchema);