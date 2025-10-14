import React, { useEffect } from 'react';
import useClassStore from '../../stores/classStore';
import useAuthStore from '../../stores/authStore';
import { Clock, User, CheckCircle, XCircle, Mail, MapPin, Calendar } from 'lucide-react';

const SubstituteRequests = () => {
  const { substituteRequests, acceptSubstituteRequest, declineSubstituteRequest, fetchSubstituteRequests } = useClassStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchSubstituteRequests();
    }
  }, [user, fetchSubstituteRequests]);

  const handleAccept = async (request) => {
    try {
      await acceptSubstituteRequest(request._id);
    } catch (error) {
      console.error('Failed to accept substitute request:', error);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await declineSubstituteRequest(requestId);
    } catch (error) {
      console.error('Failed to decline substitute request:', error);
    }
  };

  const pendingRequests = substituteRequests.filter(req => req.status === 'pending');

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Substitute Requests</h2>
        </div>
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No substitute requests at the moment.</p>
          <p className="text-sm text-gray-400">You'll be notified when colleagues need substitution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Substitute Requests</h2>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          {pendingRequests.length} pending
        </span>
      </div>

      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <div
            key={request._id}
            className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <h3 className="font-semibold text-gray-900">{request.subject}</h3>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    Urgent
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                  <div className="space-y-1">
                    <p className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">Teacher:</span> {request.originalTeacherName}
                    </p>
                    <p className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">Section:</span> {request.classId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="font-medium">Time:</span> {request.startTime} - {request.endTime}
                    </p>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Date:</span> {new Date(request.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {request.room && (
                  <p className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium">Room:</span> {request.room}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => handleAccept(request)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Accept</span>
                </button>

                <button
                  onClick={() => handleDecline(request._id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Decline</span>
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-xs text-yellow-800 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <strong>Note:</strong> Accepting this request will add this class to your schedule for today and notify students of the substitution.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubstituteRequests;