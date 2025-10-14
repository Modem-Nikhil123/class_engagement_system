import React, { useState, useEffect } from 'react';
import useAdminStore from '../../stores/adminStore';
import { MessageSquare, AlertCircle, CheckCircle, Clock, User, Edit3, X, Save, ArrowLeft } from 'lucide-react';

const ComplaintsList = () => {
  const {
    queries,
    loadingQueries,
    fetchQueries,
    updateQueryStatus
  } = useAdminStore();

  const [selectedQuery, setSelectedQuery] = useState(null);
  const [response, setResponse] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <X className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = async (queryId, newStatus) => {
    try {
      await updateQueryStatus(queryId, {
        status: newStatus,
        priority,
        adminResponse: response || undefined
      });
      setSelectedQuery(null);
      setResponse('');
      setPriority('medium');
    } catch (error) {
      console.error('Failed to update query status:', error);
    }
  };

  const handleRespond = (query) => {
    setSelectedQuery(query);
    setResponse(query.adminResponse || '');
    setPriority(query.priority || 'medium');
  };

  const handleCloseResponse = () => {
    setSelectedQuery(null);
    setResponse('');
    setPriority('medium');
  };

  if (loadingQueries) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Student Queries & Complaints</h2>
        <p className="text-gray-600">Manage and respond to student queries and complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-gray-900">
                {queries.filter(q => q.status === 'open').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {queries.filter(q => q.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {queries.filter(q => q.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{queries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Queries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Queries</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {queries.map((query) => (
            <div key={query.queryId} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                      {getStatusIcon(query.status)}
                      <span className="ml-1 capitalize">{query.status.replace('_', ' ')}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(query.priority)}`}>
                      {query.priority} priority
                    </span>
                    <span className="text-sm text-gray-500 capitalize">{query.category}</span>
                  </div>

                  <h4 className="text-lg font-medium text-gray-900 mb-2">{query.subject || 'No Subject'}</h4>
                  <p className="text-gray-700 mb-3">{query.message}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Student ID: {query.studentId}</span>
                    </div>
                    <div>
                      {new Date(query.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {query.adminResponse && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                      <p className="text-sm text-blue-800">{query.adminResponse}</p>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  {query.status === 'open' && (
                    <button
                      onClick={() => handleUpdateStatus(query.queryId, 'in_progress')}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                    >
                      Start Working
                    </button>
                  )}

                  {query.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(query.queryId, 'resolved')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}

                  <button
                    onClick={() => handleRespond(query)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Respond
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {queries.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No queries found.</p>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCloseResponse}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-2"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
                <MessageSquare className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Respond to Query</h2>
              </div>
              <button
                onClick={handleCloseResponse}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Query Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Query Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Subject:</strong> {selectedQuery.subject || 'No Subject'}</p>
                  <p><strong>Category:</strong> {selectedQuery.category}</p>
                  <p><strong>Student ID:</strong> {selectedQuery.studentId}</p>
                  <p><strong>Message:</strong> {selectedQuery.message}</p>
                </div>
              </div>

              {/* Response Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-4"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Response</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-32 resize-none"
                  placeholder="Type your response here..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleUpdateStatus(selectedQuery.queryId, selectedQuery.status)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Response</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseResponse}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsList;