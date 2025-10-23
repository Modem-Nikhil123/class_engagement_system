import React, { useCallback, useEffect, useState, useRef } from 'react';
import {useShallow} from "zustand/shallow";
import Layout from '../components/common/Layout';
import CalendarModal from '../components/common/CalendarModal';
import DateScheduleView from '../components/common/DateScheduleView';
import useClassStore from '../stores/classStore';
import useAuthStore from '../stores/authStore';
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare, User, MapPin, X, Bell, Send, Plus } from 'lucide-react';

export default function StudentDashboard() {
  const { classSlots, loading, fetchClassSchedule, submitQuery, submittingQuery } = useClassStore();
  const { user } = useAuthStore();

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [queryData, setQueryData] = useState({
    teacherId: '',
    subject: '',
    message: '',
    category: 'general'
  });

  useEffect(() => {
    if (user && !selectedDate) {
      fetchClassSchedule(user.userId, user.role);
    }
  }, [user,selectedDate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'engaged':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'not_taking':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'delayed':
        return 'bg-orange-100 border-orange-500 text-orange-700';
      case 'absent':
        return 'bg-gray-100 border-gray-500 text-gray-700';
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

  const getStatusText = (status) => {
    switch (status) {
      case 'engaged':
        return 'Class Active ';
      case 'not_taking':
        return 'Not Taking ';
      case 'delayed':
        return 'Delayed ';
      case 'absent':
        return 'Marked Absent ';
      default:
        return 'Scheduled';
    }
  };



  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    try {
      await submitQuery(queryData);
      setQueryData({
        teacherId: '',
        subject: '',
        message: '',
        category: 'general'
      });
      setIsQueryModalOpen(false);
    } catch (error) {
      console.error('Failed to submit query:', error);
    }
  };

  if (loading) {
    return (
      <Layout title="Student Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (selectedDate) {
    return (
      <Layout title="Student Dashboard">
        <DateScheduleView 
          selectedDate={selectedDate}
          onBack={() => setSelectedDate(null)}
          userRole="student"
        />
      </Layout>
    );
  }

  return(
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        {/* Welcome Section with Action Buttons */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h2>
              <p className="opacity-90">{user?.section} • Today's Schedule</p>
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
                onClick={() => setIsQueryModalOpen(true)}
                className="flex items-center space-x-2 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">Report Issue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Class Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Today's Classes</h2>
          
          {classSlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classSlots.map((slot, index) => (
                <div
                  key={`${slot.classId}-${slot.date}-${slot.startTime}-${index}`}
                  className={`p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${getStatusColor(slot.status)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{slot.subject}</h3>
                      <p className="text-sm opacity-75">{slot.teacherName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(slot.status)}
                      <span className="text-sm font-medium">{getStatusText(slot.status)}</span>
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
                      <p className="text-sm opacity-75 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Substitute: {slot.substituteTeacherName}
                      </p>
                    )}
                    
                    {slot.delayMinutes > 0 && (
                      <p className="text-sm opacity-75">
                        Delayed by {slot.delayMinutes} minutes
                      </p>
                    )}

                  </div>

                  {/* Status specific information */}
                  {slot.status === 'engaged' && !slot.studentMarkedAbsent && (
                    <div className="mt-3 p-2 bg-green-200 bg-opacity-50 rounded text-xs">
                      Teacher is present and class is active
                    </div>
                  )}
                  
                  {slot.status === 'not_taking' && !slot.substituteTeacherName && (
                    <div className="mt-3 p-2 bg-red-200 bg-opacity-50 rounded text-xs">
                      Class cancelled - Teacher not available
                    </div>
                  )}
                  
                  {slot.status === 'not_taking' && slot.substituteTeacherName && (
                    <div className="mt-3 p-2 bg-blue-200 bg-opacity-50 rounded text-xs">
                      Substitute teacher: {slot.substituteTeacherName}
                    </div>
                  )}
                  
                  {slot.status === 'delayed' && (
                    <div className="mt-3 p-2 bg-orange-200 bg-opacity-50 rounded text-xs">
                      Class will start in {slot.delayMinutes} minutes
                    </div>
                  )}


                  {slot.remarks && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                      {slot.remarks}
                    </div>
                  )}

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No classes scheduled for today.</p>
            </div>
          )}
        </div>
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
                Click on a date to view class schedule
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Query/Report Modal */}
      {isQueryModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Report Issue</h2>
              </div>
              <button
                onClick={() => setIsQueryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitQuery} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={queryData.category}
                  onChange={(e) => setQueryData({ ...queryData, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">General Query</option>
                  <option value="attendance">Attendance Issue</option>
                  <option value="timetable">Timetable Problem</option>
                  <option value="substitute">Substitute Teacher</option>
                  <option value="delay">Class Delay</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject (Optional)</label>
                <input
                  type="text"
                  value={queryData.subject}
                  onChange={(e) => setQueryData({ ...queryData, subject: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={queryData.message}
                  onChange={(e) => setQueryData({ ...queryData, message: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                  placeholder="Describe your issue or query..."
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submittingQuery}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {submittingQuery ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{submittingQuery ? 'Submitting...' : 'Submit Query'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQueryModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}
