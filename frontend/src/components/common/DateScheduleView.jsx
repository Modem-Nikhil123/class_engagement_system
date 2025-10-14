import React, { useCallback, useEffect, useState, useRef } from 'react';
import {useShallow} from "zustand/shallow";
// import ClassSlotCard from '../teacher/ClassSlotCard';
import useClassStore from '../../stores/classStore';
import useAuthStore from '../../stores/authStore';
import { Calendar, Clock, ArrowLeft, MapPin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const DateScheduleView = ({ selectedDate, onBack, userRole }) => {

  const { classSlots, loading, fetchClassSchedule } = useClassStore();

  const { user } = useAuthStore();

  useEffect(() => {
    if (user && selectedDate) {
      fetchClassSchedule(user.userId, user.role, selectedDate);
    }
  }, [user, selectedDate]);

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
        return 'Class Active ✅';
      case 'not_taking':
        return 'Not Taking ❌';
      case 'delayed':
        return 'Delayed ⏳';
      case 'absent':
        return 'Marked Absent ⚠️';
      default:
        return 'Scheduled';
    }
  };

  // const dateSlots = classSlots.filter(slot => {
  //   if (userRole === 'teacher') {
  //     return slot.date === selectedDate && slot.teacherId === user?.id;
  //   } else if (userRole === 'student') {
  //     return slot.date === selectedDate && slot.section === user?.section;
  //   } else if (userRole === 'admin') {
  //     return slot.date === selectedDate;
  //   }
  //   return false;
  // });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isFuture = selectedDate > new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {formatDate(selectedDate)}
                </h2>
                <p className="text-sm text-gray-500">
                  {isToday ? 'Today\'s Schedule' : isFuture ? 'Future Planning Mode' : 'Past Schedule'}
                </p>
              </div>
            </div>
          </div>
          
          {isFuture && userRole === 'teacher' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <p className="text-xs text-blue-800 font-medium">
                📅 Future Planning Mode - Pre-arrange substitutes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Classes for Selected Date */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {userRole === 'admin' ? 'All Classes' : 'Your Classes'}
        </h3>
        
        {classSlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classSlots.map((slot,index) => (
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
                    
                    {/* {slot.substituteTeacherName && (
                      <p className="text-sm opacity-75 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Substitute: {slot.substituteTeacherName}
                      </p>
                    )}
                    
                    {slot.delayMinutes && (
                      <p className="text-sm opacity-75">
                        Delayed by {slot.delayMinutes} minutes
                      </p>
                    )}

                    {slot.studentMarkedAbsent && (
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded text-xs text-yellow-700">
                        ⏳ Teacher has been notified of absence report
                      </div>
                    )} */}
                  </div>

                  {/* Status specific information */}
                  {slot.status === 'engaged' && (
                    <div className="mt-3 p-2 bg-green-200 bg-opacity-50 rounded text-xs">
                      ✅ Teacher is present and class is active
                    </div>
                  )}
                  
                  {slot.status === 'not_taking' && !slot.substituteTeacherName && (
                    <div className="mt-3 p-2 bg-red-200 bg-opacity-50 rounded text-xs">
                      ❌ Class cancelled - Teacher not available
                    </div>
                  )}
                  
                  {slot.status === 'not_taking' && slot.substituteTeacherName && (
                    <div className="mt-3 p-2 bg-blue-200 bg-opacity-50 rounded text-xs">
                      🔄 Substitute teacher assigned
                    </div>
                  )}
                  
                  {slot.status === 'delayed' && (
                    <div className="mt-3 p-2 bg-orange-200 bg-opacity-50 rounded text-xs">
                      ⏰ Class will start in {slot.delayMinutes} minutes
                    </div>
                  )}

                  {slot.status === 'absent' && (
                    <div className="mt-3 p-2 bg-gray-200 bg-opacity-50 rounded text-xs">
                      ⚠️ Teacher marked as absent by student report
                    </div>
                  )}

                  {/* Mark Absent Button */}
                  {/* {canMarkAbsent(slot) && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleMarkAbsent(slot)}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200 text-sm"
                      >
                        <AlertCircleIcon className="h-4 w-4" />
                        <span>Mark Teacher as Absent</span>
                      </button>
                    </div>
                  )} */}
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

      {/* Future Planning Info */}
      {/* {isFuture && userRole === 'teacher' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Future Planning Features:</p>
              <ul className="space-y-1 list-disc list-inside text-xs">
                <li>Pre-arrange substitute teachers for planned absences</li>
                <li>Mark classes as delayed in advance</li>
                <li>Students and admin will see updates on the scheduled date</li>
                <li>Changes can be modified until the actual class date</li>
              </ul>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default DateScheduleView;