import React, { useState, useEffect } from 'react';
import useReminderStore from '../../stores/reminderStore';
import useAuthStore from '../../stores/authStore';
import { X, Bell, Clock, Calendar, Plus } from 'lucide-react';

const ReminderModal = ({ isOpen, onClose, classSlot = null, currentReminder = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const { createReminder, updateReminder, loading } = useReminderStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (currentReminder) {
      setTitle(currentReminder.title);
      setDescription(currentReminder.description || '');
      setTime(currentReminder.time);
      setDate(new Date(currentReminder.date).toLocaleDateString('en-CA'));
    } else if (classSlot) {
      setTitle(`${classSlot.subject} - Section ${classSlot.classId}`);
      setDescription('');
      setTime('');
      setDate(new Date().toLocaleDateString('en-CA'));
    } else {
      setTitle('');
      setDescription('');
      setTime('');
      setDate(new Date().toLocaleDateString('en-CA'));
    }
  }, [currentReminder, classSlot, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user) {
      const reminderData = {
        teacherId: user.userId,
        title: title || 'Untitled Reminder',
        description,
        time: time || '09:00',
        date: date || new Date().toLocaleDateString('en-CA'),
      };

      try {
        if (currentReminder) {
          await updateReminder(currentReminder._id, reminderData);
        } else {
          await createReminder(reminderData);
        }

        // Reset form
        setTitle('');
        setDescription('');
        setTime('');
        setDate(new Date().toLocaleDateString('en-CA'));
        onClose();
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{currentReminder ? 'Edit Reminder' : 'Set Reminder'}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Mathematics Class - Section C1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Add more details about this reminder..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <Bell className="h-4 w-4 inline mr-1" />
              <strong>Note:</strong> You'll receive an email reminder at the specified date and time.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>{currentReminder ? 'Update Reminder' : 'Set Reminder'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;