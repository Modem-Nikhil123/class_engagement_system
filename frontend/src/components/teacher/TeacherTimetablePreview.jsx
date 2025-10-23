import React, { useState, useEffect } from 'react';
import useClassStore from '../../stores/classStore';
import { Clock, MapPin, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const TeacherTimetablePreview = ({ teacherId, requestedDate, requestedStartTime, requestedEndTime }) => {
  const { getTeacherSchedule } = useClassStore();
  const [schedule, setSchedule] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (teacherId) {
      fetchTeacherSchedule();
    }
  }, [teacherId, requestedDate, requestedStartTime, requestedEndTime]);

  const fetchTeacherSchedule = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (requestedDate && requestedStartTime && requestedEndTime) {
        params.requestedDate = requestedDate;
        params.requestedStartTime = requestedStartTime;
        params.requestedEndTime = requestedEndTime;
      }

      const result = await getTeacherSchedule(teacherId, params);
      setSchedule(result.schedule);
      setConflicts(result.conflicts || []);
    } catch (err) {
      setError('Failed to load teacher schedule');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (slot, isRequestedSlot = false) => {
    if (isRequestedSlot) {
      return 'bg-blue-100 border-blue-500 text-blue-700';
    }

    // Check if this slot conflicts with requested time
    const hasConflict = conflicts.some(conflict =>
      conflict.startTime === slot.startTime &&
      conflict.endTime === slot.endTime &&
      conflict.subject === slot.subject
    );

    if (hasConflict) {
      return 'bg-red-100 border-red-500 text-red-700';
    }

    return 'bg-green-100 border-green-500 text-green-700';
  };

  const getStatusIcon = (slot, isRequestedSlot = false) => {
    if (isRequestedSlot) {
      return <Clock className="h-4 w-4" />;
    }

    const hasConflict = conflicts.some(conflict =>
      conflict.startTime === slot.startTime &&
      conflict.endTime === slot.endTime &&
      conflict.subject === slot.subject
    );

    if (hasConflict) {
      return <XCircle className="h-4 w-4" />;
    }

    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = (slot, isRequestedSlot = false) => {
    if (isRequestedSlot) {
      return 'Requested Slot';
    }

    const hasConflict = conflicts.some(conflict =>
      conflict.startTime === slot.startTime &&
      conflict.endTime === slot.endTime &&
      conflict.subject === slot.subject
    );

    if (hasConflict) {
      return 'Conflict';
    }

    return 'Available';
  };

  const isRequestedSlot = (slot) => {
    return requestedDate && requestedStartTime && requestedEndTime &&
           slot.startTime === requestedStartTime &&
           slot.endTime === requestedEndTime;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-2 text-gray-600">Loading schedule...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-center py-8 text-red-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-center py-8 text-gray-500">
          Select a teacher to view their schedule
        </div>
      </div>
    );
  }

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Schedule Preview</h3>

      {/* Availability Status */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          {conflicts.length === 0 ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">Available for requested time slot</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700 font-medium">Conflicts detected ({conflicts.length})</span>
            </>
          )}
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {daysOfWeek.map(day => (
          <div key={day} className="border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-3 text-center">{day}</h4>

            {schedule[day] && schedule[day].length > 0 ? (
              <div className="space-y-2">
                {schedule[day].map((slot, index) => (
                  <div
                    key={`${day}-${index}`}
                    className={`p-2 rounded border text-xs ${getStatusColor(slot, isRequestedSlot(slot))}`}
                  >
                    <div className="flex items-center space-x-1 mb-1">
                      {getStatusIcon(slot, isRequestedSlot(slot))}
                      <span className="font-medium">{getStatusText(slot, isRequestedSlot(slot))}</span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium">{slot.subject}</p>
                      <p className="text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {slot.startTime} - {slot.endTime}
                      </p>
                      {slot.room && (
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {slot.room}
                        </p>
                      )}
                      <p className="text-gray-600">Class: {slot.classId}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center">No classes</p>
            )}
          </div>
        ))}
      </div>

      {/* Conflicts Summary */}
      {conflicts.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">Conflicts:</h4>
          <ul className="space-y-1">
            {conflicts.map((conflict, index) => (
              <li key={index} className="text-sm text-red-700">
                • {conflict.type === 'permanent_schedule' ? 'Regular class' : 'Existing assignment'}: {conflict.subject} ({conflict.startTime} - {conflict.endTime})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeacherTimetablePreview;