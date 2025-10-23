import React, { useState, useEffect } from 'react';
import useClassStore from '../../stores/classStore';
import TeacherSearchDropdown from './TeacherSearchDropdown';
import TeacherTimetablePreview from './TeacherTimetablePreview';
import { CheckCircle, Users, User, Loader2, X } from 'lucide-react';

const EnhancedSubstituteAssignmentModal = ({ isOpen, onClose, classSlot }) => {
  const { createSubstituteRequest, assignSubstituteTeacher } = useClassStore();

  const [assignmentMethod, setAssignmentMethod] = useState('manual');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setAssignmentMethod('manual');
      setSelectedTeacher(null);
      setRemarks('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!classSlot) return;

    setLoading(true);

    try {
      if (assignmentMethod === 'broadcast') {
        // Create substitute request for broadcast
        await createSubstituteRequest({
          classId: classSlot.classId,
          subject: classSlot.subject,
          date: classSlot.date,
          startTime: classSlot.startTime,
          endTime: classSlot.endTime,
          room: classSlot.room
        });
      } else if (assignmentMethod === 'manual' && selectedTeacher) {
        // Assign specific teacher
        await assignSubstituteTeacher({
          classId: classSlot.classId,
          teacherId: classSlot.teacherId,
          date: classSlot.date,
          subject: classSlot.subject,
          startTime: classSlot.startTime,
          endTime: classSlot.endTime,
          room: classSlot.room,
          substituteTeacherId: selectedTeacher.teacherId,
          remarks
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to assign substitute:', error);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = () => {
    if (assignmentMethod === 'broadcast') {
      return true;
    }
    if (assignmentMethod === 'manual') {
      return selectedTeacher !== null;
    }
    return false;
  };

  if (!isOpen || !classSlot) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Assign Substitute Teacher</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Class Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Class Details:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Subject:</strong> {classSlot.subject}</p>
                <p><strong>Section:</strong> {classSlot.classId}</p>
              </div>
              <div>
                <p><strong>Time:</strong> {classSlot.startTime} - {classSlot.endTime}</p>
                <p><strong>Date:</strong> {new Date(classSlot.date).toLocaleDateString()}</p>
                {classSlot.room && <p><strong>Room:</strong> {classSlot.room}</p>}
              </div>
            </div>
          </div>

          {/* Assignment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Assignment Method
            </label>
            <div className="space-y-3">
              <div
                onClick={() => setAssignmentMethod('manual')}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  assignmentMethod === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    assignmentMethod === 'manual' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {assignmentMethod === 'manual' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Manual Assignment</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Search and select a specific substitute teacher
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setAssignmentMethod('broadcast')}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  assignmentMethod === 'broadcast' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    assignmentMethod === 'broadcast' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {assignmentMethod === 'broadcast' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Broadcast Request</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Send notification to all available teachers for this time slot
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Assignment Section */}
          {assignmentMethod === 'manual' && (
            <div className="space-y-4">
              <TeacherSearchDropdown
                onTeacherSelect={setSelectedTeacher}
                selectedTeacher={selectedTeacher}
                date={classSlot.date}
                startTime={classSlot.startTime}
                endTime={classSlot.endTime}
              />

              {selectedTeacher && (
                <TeacherTimetablePreview
                  teacherId={selectedTeacher.teacherId}
                  requestedDate={classSlot.date}
                  requestedStartTime={classSlot.startTime}
                  requestedEndTime={classSlot.endTime}
                />
              )}
            </div>
          )}

          {/* Broadcast Assignment Info */}
          {assignmentMethod === 'broadcast' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Broadcast Assignment</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    An email notification will be sent to all available teachers for this time slot.
                    The first teacher to accept the request will be assigned as substitute.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || loading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>{loading ? 'Assigning...' : 'Assign Substitute'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSubstituteAssignmentModal;