import React, { useState } from 'react';
import useClassStore from '../../stores/classStore';
import useAuthStore from '../../stores/authStore';
import { X, AlertTriangle, Send, Clock, User } from 'lucide-react';

const AbsentTeacherModal = ({ isOpen, onClose, classSlot }) => {
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const { markTeacherAbsent, loading } = useClassStore();
  const { user } = useAuthStore();

  const absentReasons = [
    'Teacher did not show up for class',
    'Class time passed without teacher arrival',
    'No communication from teacher about delay',
    'Teacher left early without completing class',
    'Other reason (specify below)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (user && classSlot && reason) {
      try {
        await markTeacherAbsent(classSlot.id, user.id);
        onClose();
      } catch (error) {
        // Error handled by store
      }
    }
  };

  if (!isOpen || !classSlot) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Mark Teacher as Absent</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Class Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Class Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium">Subject:</span> {classSlot.subject}
              </p>
              <p className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium">Teacher:</span> {classSlot.teacherName}
              </p>
              <p className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Time:</span> {classSlot.startTime} - {classSlot.endTime}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Why are you marking the teacher as absent?
              </label>
              <div className="space-y-2">
                {absentReasons.map((reasonOption, index) => (
                  <label
                    key={index}
                    className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      reason === reasonOption
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reasonOption}
                      checked={reason === reasonOption}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1"
                      required
                    />
                    <span className="text-sm">{reasonOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {reason === 'Other reason (specify below)' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify the reason
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
                  placeholder="Please provide more details..."
                  required
                />
              </div>
            )}

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-2">What happens next:</p>
                  <ul className="space-y-1 list-disc list-inside text-xs">
                    <li>The teacher will be notified immediately</li>
                    <li>They have 15 minutes to respond and update their status</li>
                    <li>If no response, the class will be marked as absent</li>
                    <li>Administration will be notified for follow-up</li>
                  </ul>
                </div>
              </div>
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
                disabled={loading || !reason}
                className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Mark as Absent</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AbsentTeacherModal;