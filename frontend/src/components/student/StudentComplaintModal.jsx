import React, { useState } from 'react';
import useComplaintStore from '../../stores/complaintStore';
import useAuthStore from '../../stores/authStore';
import { X, MessageSquare, Send, AlertTriangle } from 'lucide-react';

const StudentComplaintModal = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [complaint, setComplaint] = useState('');
  const [complaintType, setComplaintType] = useState('absence');
  const { addComplaint, loading } = useComplaintStore();
  const { user } = useAuthStore();

  const complaintTypes = [
    { value: 'absence', label: 'Teacher Absence', description: 'Teacher did not attend class' },
    { value: 'delay', label: 'Frequent Delays', description: 'Teacher frequently comes late' },
    { value: 'cancellation', label: 'Class Cancellation', description: 'Class cancelled without notice' },
    { value: 'other', label: 'Other Issue', description: 'Other academic concerns' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (user && subject && teacherName && complaint) {
      try {
        await addComplaint({
          studentId: user.id,
          studentName: user.name,
          section: user.section || '',
          subject,
          teacherName,
          complaint,
          complaintType,
          date: new Date().toISOString().split('T')[0],
        });
        
        // Reset form
        setSubject('');
        setTeacherName('');
        setComplaint('');
        setComplaintType('absence');
        onClose();
      } catch (error) {
        // Error handled by store
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Report an Issue</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
            <div className="grid grid-cols-1 gap-2">
              {complaintTypes.map((type) => (
                <label
                  key={type.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    complaintType === type.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="complaintType"
                    value={type.value}
                    checked={complaintType === type.value}
                    onChange={(e) => setComplaintType(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      complaintType === type.value
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300'
                    }`}>
                      {complaintType === type.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Mathematics"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Name</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Dr. Smith"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all duration-200"
              placeholder="Please describe the issue in detail..."
              required
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">Important Guidelines:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Provide accurate and detailed information</li>
                  <li>Reports are reviewed by administration</li>
                  <li>False reports may result in disciplinary action</li>
                  <li>Use this feature responsibly</li>
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
              disabled={loading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentComplaintModal;