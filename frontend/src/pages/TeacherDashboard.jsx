import React, { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import ReminderModal from '../components/teacher/ReminderModal';
import SubstituteRequests from '../components/teacher/SubstituteRequests';
import CalendarModal from '../components/common/CalendarModal';
import DateScheduleView from '../components/common/DateScheduleView';
import useClassStore from '../stores/classStore';
import useReminderStore from '../stores/reminderStore';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, Bell, Plus, User, MapPin, Edit3, Save, X, AlertCircleIcon, ArrowLeft } from 'lucide-react';

const TeacherDashboard = () => {
  const { classSlots, fetchClassSchedule, updateClassStatus, respondToAbsenceReport, createSubstituteRequest, updateClassSlotStatus, loading } = useClassStore();
  const { reminders, fetchReminders, updateReminder, deleteReminder, toggleReminder } = useReminderStore();
  const { user } = useAuthStore();
  
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  // const [showDateView, setShowDateView] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'engaged',
    delayMinutes: 0,
    substituteTeacherId: '',
    remarks: ''
  });
  const [substituteOption, setSubstituteOption] = useState(''); // 'provide' or 'notify'

  useEffect(() => {
    if (user && !selectedDate) {
      fetchClassSchedule(user.userId, user.role);
      fetchReminders(user.userId);
    }
  }, [user,selectedDate,fetchReminders,fetchClassSchedule]);

  // Refresh reminders after modal operations
  // useEffect(() => {
  //   if (user && !selectedDate && !isReminderModalOpen) {
  //     fetchReminders(user.userId);
  //   }
  // }, [reminders,fetchReminders,isReminderModalOpen, user]);

  const activeReminders = reminders.filter(reminder =>
    reminder.date === new Date().toLocaleDateString('en-CA')
  );

  const upcomingReminders = reminders.sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleDateSelect = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
  };

  const handleBackToToday = () => {
    setSelectedDate(null);
  };

  const todaySlots = classSlots.filter(slot => {
    const today = new Date().toLocaleDateString('en-CA');
    console.log('Filtering slot:', slot.date, 'against today:', today);
    return slot.date === today;
  });

  console.log('All classSlots:', classSlots);
  console.log('Filtered todaySlots:', todaySlots);

  const getStatCount = (status) => {
    return todaySlots.filter(slot => slot.status === status).length;
  };

  const handleEditStatus = (slot) => {
    setEditingSlot(slot);
    setStatusUpdate({
      status: slot.status || 'engaged',
      delayMinutes: slot.delayMinutes || 0,
      substituteTeacherId: slot.substituteTeacherId || '',
      remarks: slot.remarks || ''
    });
  };

  const handleSaveStatus = async () => {
    if (!editingSlot) return;

    try {
      let finalStatus = statusUpdate.status;

      // If status is 'not_taking' and option is 'notify', set status to 'assigning_substitute' and create request
      if (statusUpdate.status === 'not_taking' && substituteOption === 'notify') {
        finalStatus = 'assigning_substitute';
        await createSubstituteRequest({
          classId: editingSlot.classId,
          subject: editingSlot.subject,
          date: editingSlot.date,
          startTime: editingSlot.startTime,
          endTime: editingSlot.endTime,
          room: editingSlot.room
        });
      }

      await updateClassStatus({
        classId: editingSlot.classId,
        teacherId: editingSlot.teacherId,
        date: editingSlot.date,
        subject: editingSlot.subject,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        room: editingSlot.room,
        ...statusUpdate,
        status: finalStatus
      });

      // Update the local state immediately to reflect changes
      updateClassSlotStatus({
        classId: editingSlot.classId,
        date: editingSlot.date,
        subject: editingSlot.subject,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        ...statusUpdate,
        status: finalStatus
      });

      setEditingSlot(null);
      setStatusUpdate({
        status: 'engaged',
        delayMinutes: 0,
        substituteTeacherId: '',
        remarks: ''
      });
      setSubstituteOption('');
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAbsenceResponse = async (slot, response, actualStatus) => {
    try {
      await respondToAbsenceReport({
        classId: slot.classId,
        date: slot.date,
        subject: slot.subject,
        startTime: slot.startTime,
        response,
        actualStatus
      });
    } catch (error) {
      console.error('Failed to respond to absence report:', error);
    }
  };

  const handleToggleReminder = async (reminderId) => {
    try {
      await toggleReminder(reminderId);
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
    }
  };

  const handleEditReminder = (reminder) => {
    setCurrentReminder(reminder);
    setIsReminderModalOpen(true);
  };

  const handleDeleteReminder = async (reminderId) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await deleteReminder(reminderId);
      } catch (error) {
        console.error('Failed to delete reminder:', error);
      }
    }
  };

  const getStatusColor = (status, hasSubstitute = false) => {
    // Special case: engaged with substitute gets purple color
    if (status === 'engaged' && hasSubstitute) {
      return 'bg-purple-100 border-purple-500 text-purple-700';
    }

    switch (status) {
      case 'engaged':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'not_taking':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'delayed':
        return 'bg-orange-100 border-orange-500 text-orange-700';
      case 'absent':
        return 'bg-gray-100 border-gray-500 text-gray-700';
      case 'assigning_substitute':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'engaged':
        return <CheckCircle className="h-5 w-5" />;
      case 'not_taking':
        return <XCircle className="h-5 w-5" />;
      case 'delayed':
        return <AlertTriangle className="h-5 w-5" />;
      case 'absent':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusText = (status, hasSubstitute = false) => {
    if (status === 'engaged' && hasSubstitute) {
      return 'Substitute Active';
    }

    switch (status) {
      case 'engaged':
        return 'Active';
      case 'not_taking':
        return 'Not Taking';
      case 'delayed':
        return 'Delayed';
      case 'absent':
        return 'Absent';
      case 'assigning_substitute':
        return 'Finding Substitute';
      default:
        return 'Scheduled';
    }
  };

  if (selectedDate) {
    return (
      <Layout title="Teacher Dashboard">
        <DateScheduleView 
          selectedDate={selectedDate}
          onBack={handleBackToToday}
          userRole="teacher"
        />
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="Teacher Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Teacher Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
              <p className="opacity-90">Manage your classes and update status</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="flex items-center space-x-2 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Calendar</span>
              </button>

              <button
                onClick={() => setIsReminderModalOpen(true)}
                className="flex items-center space-x-2 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Set Reminder</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Reminders */}
        {reminders.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Bell className="h-5 w-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-800">Upcoming Reminders</h3>
            </div>
            <div className="space-y-2">
              {reminders.map(reminder => (
                <div key={reminder._id} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{reminder.title}</p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleReminder(reminder._id)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            reminder.isCompleted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {reminder.isCompleted ? 'Completed' : 'Pending'}
                        </button>
                        <button
                          onClick={() => handleEditReminder(reminder)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(reminder.date).toLocaleDateString('en-IN')}
                      <Clock className="h-4 w-4 inline mr-1" />
                      {reminder.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Today's Classes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Today's Classes</h2>
          {todaySlots.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {todaySlots.map((slot, index) => (
                <div
                  key={`${slot.classId}-${slot.date}-${slot.startTime}-${index}`}
                  className={`p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${getStatusColor(slot.status, !!slot.substituteTeacherId)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{slot.subject}</h3>
                      <p className="text-sm opacity-75">Section: {slot.classId}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(slot.status)}
                      <span className="text-sm font-medium">{getStatusText(slot.status, !!slot.substituteTeacherId)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm opacity-75 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {slot.startTime} - {slot.endTime}
                    </p>
                    
                    {slot.room && (
                      <p className="text-sm opacity-75 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {slot.room}
                      </p>
                    )}
                    
                    {slot.substituteTeacherName && (
                      <p className="text-sm font-medium flex items-center text-purple-600">
                        <User className="h-4 w-4 mr-1" />
                        Substitute Teacher: {slot.substituteTeacherName}
                      </p>
                    )}
                    
                    {slot.delayMinutes > 0 && (
                      <p className="text-sm opacity-75">
                        Delayed by {slot.delayMinutes} minutes
                      </p>
                    )}
                  </div>

                  {/* Student Absence Report Alert */}
                  {slot.studentMarkedAbsent && !slot.teacherResponse && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircleIcon className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Student Absence Report</span>
                      </div>
                      <p className="text-xs text-red-700 mb-3">
                        A student has reported you as absent. Please respond within the grace period.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAbsenceResponse(slot, 'I was present', 'engaged')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          I was present
                        </button>
                        <button
                          onClick={() => handleAbsenceResponse(slot, 'I was absent', 'absent')}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Confirm absent
                        </button> 
                      </div>
                    </div>
                  )}

                  {/* Status specific information */}
                  {slot.status === 'engaged' && slot.substituteTeacherId && (
                    <div className="mt-3 p-2 bg-purple-200 bg-opacity-50 rounded text-xs text-purple-800">
                      Class is active with substitute teacher
                    </div>
                  )}

                  {slot.status === 'engaged' && !slot.substituteTeacherId && !slot.studentMarkedAbsent && (
                    <div className="mt-3 p-2 bg-green-200 bg-opacity-50 rounded text-xs">
                      Class is active and proceeding as scheduled
                    </div>
                  )}

                  {slot.status === 'not_taking' && (
                    <div className="mt-3 p-2 bg-red-200 bg-opacity-50 rounded text-xs">
                      Class cancelled
                    </div>
                  )}

                  {slot.status === 'assigning_substitute' && (
                    <div className="mt-3 p-2 bg-yellow-200 bg-opacity-50 rounded text-xs text-yellow-800">
                      Finding substitute teacher - Request sent to available teachers
                    </div>
                  )}

                  {slot.status === 'delayed' && (
                    <div className="mt-3 p-2 bg-orange-200 bg-opacity-50 rounded text-xs">
                       Class delayed by {slot.delayMinutes} minutes
                    </div>
                  )}

                  {slot.status === 'absent' && (
                    <div className="mt-3 p-2 bg-gray-200 bg-opacity-50 rounded text-xs">
                       Marked as absent
                    </div>
                  )}

                  {slot.remarks && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                       {slot.remarks}
                    </div>
                  )}

                  {/* Update Status Button */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleEditStatus(slot)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No classes scheduled for today.</p>
            </div>
          )}
        </div>

        {/* Substitute Requests Section */}
        <SubstituteRequests />
      </div>

      {/* Calendar Modal */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Select Date</h2>
              </div>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <CalendarModal
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setIsCalendarModalOpen(false); 
                }}
              />
              <div className="mt-4 text-xs text-gray-500 text-center">
                Click on a date to view or manage classes
              </div>
            </div>
          </div>
        </div>
      )}

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setCurrentReminder(null);
        }}
        currentReminder={currentReminder}
      />

      {/* Status Update Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingSlot(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-2"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
                <Edit3 className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Update Class Status</h2>
              </div>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Class Details:</h3>
                <p className="text-sm text-gray-600"><strong>Subject:</strong> {editingSlot.subject}</p>
                <p className="text-sm text-gray-600"><strong>Section:</strong> {editingSlot.classId}</p>
                <p className="text-sm text-gray-600"><strong>Time:</strong> {editingSlot.startTime} - {editingSlot.endTime}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="engaged">Active/Engaged</option>
                  <option value="delayed">Delayed</option>
                  <option value="not_taking">Not Taking</option>
                </select>
              </div>

              {statusUpdate.status === 'delayed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delay (minutes)</label>
                  <input
                    type="number"
                    value={statusUpdate.delayMinutes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, delayMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="120"
                  />
                </div>
              )}

              {statusUpdate.status === 'not_taking' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose an option:</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="substituteOption"
                          value="provide"
                          checked={substituteOption === 'provide'}
                          onChange={(e) => setSubstituteOption(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Provide substitute teacher ID</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="substituteOption"
                          value="notify"
                          checked={substituteOption === 'notify'}
                          onChange={(e) => setSubstituteOption(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Send notification to available teachers</span>
                      </label>
                    </div>
                  </div>

                  {substituteOption === 'provide' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Substitute Teacher ID</label>
                      <input
                        type="text"
                        value={statusUpdate.substituteTeacherId}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, substituteTeacherId: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter substitute teacher ID"
                      />
                    </div>
                  )}

                  {substituteOption === 'notify' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> An email will be sent to all available teachers for this time slot.
                        The first teacher to accept will be assigned as substitute.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
                <textarea
                  value={statusUpdate.remarks}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, remarks: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveStatus}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Status</span>
                </button>
                <button
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TeacherDashboard;