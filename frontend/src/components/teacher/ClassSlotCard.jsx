import React, { useState } from 'react';
import useClassStore from '../../stores/classStore';
import { Clock, User, AlertTriangle, CheckCircle, XCircle, RotateCcw, Mail, MapPin, Calendar } from 'lucide-react';

const ClassSlotCard = ({ slot, isFutureMode = false, userRole = 'teacher' }) => {
  const { updateClassStatus, addSubstituteRequest } = useClassStore();
  const [showDelayInput, setShowDelayInput] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [showSubstituteInput, setShowSubstituteInput] = useState(false);
  const [substituteTeacher, setSubstituteTeacher] = useState('');

  const isReadOnly = userRole !== 'teacher' || (!isFutureMode && slot.date !== new Date().toISOString().split('T')[0]);

  const getStatusColor = () => {
    switch (slot.status) {
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

  const getStatusIcon = () => {
    switch (slot.status) {
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

  const getStatusText = () => {
    switch (slot.status) {
      case 'engaged':
        return 'Class Active';
      case 'not_taking':
        return 'Not Taking';
      case 'delayed':
        return 'Delayed';
      case 'absent':
        return 'Marked Absent';
      default:
        return 'Scheduled';
    }
  };

  const handleStatusUpdate = (status) => {
    if (slot.status === status) {
      // Undo operation - revert to scheduled
      updateClassStatus(slot.id, 'scheduled');
      setShowDelayInput(false);
      setShowSubstituteInput(false);
      return;
    }

    if (status === 'delayed') {
      setShowDelayInput(true);
      return;
    }

    if (status === 'not_taking') {
      setShowSubstituteInput(true);
      return;
    }

    updateClassStatus(slot.id, status);
  };

  const handleDelaySubmit = () => {
    updateClassStatus(slot.id, 'delayed', { 
      delayMinutes,
      estimatedStartTime: calculateDelayedTime(slot.startTime, delayMinutes)
    });
    setShowDelayInput(false);
  };

  const handleSubstituteSubmit = () => {
    if (substituteTeacher.trim()) {
      // Direct substitute assignment - no email notification
      updateClassStatus(slot.id, 'not_taking', { 
        substituteTeacherId: 'sub-001', 
        substituteTeacherName: substituteTeacher 
      });
    } else {
      // No substitute specified - send notification to other teachers
      updateClassStatus(slot.id, 'not_taking');
      addSubstituteRequest({
        originalTeacherId: slot.teacherId,
        originalTeacherName: slot.teacherName,
        classSlotId: slot.id,
        subject: slot.subject,
        section: slot.section,
        startTime: slot.startTime,
        endTime: slot.endTime,
        date: slot.date,
        room: slot.room,
        status: 'pending',
      });
    }
    setShowSubstituteInput(false);
    setSubstituteTeacher('');
  };

  const getCardTitle = () => {
    if (userRole === 'admin') {
      return `${slot.subject} - Section ${slot.section}`;
    }
    return slot.subject;
  };

  const getCardSubtitle = () => {
    if (userRole === 'admin') {
      return slot.teacherName;
    }
    return `Section ${slot.section}`;
  };

  const calculateDelayedTime = (startTime, delayMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + delayMinutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{getCardTitle()}</h3>
          <div className="space-y-1 text-sm opacity-75">
            <p className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {getCardSubtitle()}
            </p>
            <p className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {slot.room}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm opacity-75 flex items-center mb-2">
          <Clock className="h-4 w-4 mr-1" />
          {slot.startTime} - {slot.endTime}
          {slot.delayMinutes && (
            <span className="ml-2 px-2 py-1 bg-orange-200 rounded text-xs">
              Delayed by {slot.delayMinutes} min
            </span>
          )}
        </p>
        
        {slot.substituteTeacherName && (
          <p className="text-sm opacity-75 flex items-center">
            <User className="h-4 w-4 mr-1" />
            Substitute: {slot.substituteTeacherName}
          </p>
        )}

        {slot.studentMarkedAbsent && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            ⚠️ Student marked you as absent. Please update your status.
          </div>
        )}
      </div>

      {isFutureMode && userRole === 'teacher' && (
        <div className="mb-4 p-2 bg-blue-100 border border-blue-200 rounded text-xs text-blue-700">
          <Calendar className="h-3 w-3 inline mr-1" />
          Future Planning Mode - Changes will take effect on {new Date(slot.date).toLocaleDateString()}
        </div>
      )}

      {showDelayInput && (
        <div className="mb-4 p-3 bg-white rounded-lg border">
          <label className="block text-sm font-medium mb-2">Delay time (minutes):</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
              min="1"
              max="60"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={handleDelaySubmit}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200"
            >
              Set Delay
            </button>
            <button
              onClick={() => setShowDelayInput(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showSubstituteInput && (
        <div className="mb-4 p-3 bg-white rounded-lg border">
          <label className="block text-sm font-medium mb-2">Substitute teacher (optional):</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={substituteTeacher}
              onChange={(e) => setSubstituteTeacher(e.target.value)}
              placeholder="Enter teacher name or leave empty"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              onClick={handleSubstituteSubmit}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowSubstituteInput(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-500 flex items-center">
            <Mail className="h-3 w-3 mr-1" />
            Leave empty to notify other teachers for substitution
          </p>
        </div>
      )}

      {!isReadOnly && (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleStatusUpdate('engaged')}
            className={`py-2 px-3 rounded-md font-medium transition-all duration-200 text-sm ${
              slot.status === 'engaged'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-green-600 text-green-600 hover:bg-green-50'
            }`}
          >
            {slot.status === 'engaged' ? (
              <div className="flex items-center justify-center space-x-1">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Undo</span>
              </div>
            ) : (
              'Take Class'
            )}
          </button>

          <button
            onClick={() => handleStatusUpdate('delayed')}
            className={`py-2 px-3 rounded-md font-medium transition-all duration-200 text-sm ${
              slot.status === 'delayed'
                ? 'bg-orange-600 text-white'
                : 'bg-white border border-orange-600 text-orange-600 hover:bg-orange-50'
            }`}
          >
            {slot.status === 'delayed' ? (
              <div className="flex items-center justify-center space-x-1">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Undo</span>
              </div>
            ) : (
              'Delay'
            )}
          </button>

          <button
            onClick={() => handleStatusUpdate('not_taking')}
            className={`py-2 px-3 rounded-md font-medium transition-all duration-200 text-sm ${
              slot.status === 'not_taking'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-red-600 text-red-600 hover:bg-red-50'
            }`}
          >
            {slot.status === 'not_taking' ? (
              <div className="flex items-center justify-center space-x-1">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Undo</span>
              </div>
            ) : (
              'Not Taking'
            )}
          </button>
        </div>
      )}

      {isReadOnly && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-500">
            {userRole === 'admin' ? 'Admin View - Read Only' : 'View Only'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassSlotCard;