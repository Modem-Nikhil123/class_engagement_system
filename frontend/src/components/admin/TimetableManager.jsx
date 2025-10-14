import React, { useState, useEffect } from 'react';
import useAdminStore from '../../stores/adminStore';
import { Calendar, Plus, Edit3, Trash2, Clock, MapPin, User, X, Save, Zap, ArrowLeft } from 'lucide-react';

const TimetableManager = () => {
  const {
    timetable,
    loadingTimetable,
    fetchTimetable,
    addTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
    generateTimetable
  } = useAdminStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    classId: '',
    subject: '',
    teacherId: '',
    dayOfWeek: '',
    slot: '',
    startTime: '',
    endTime: '',
    room: ''
  });

  const [generateData, setGenerateData] = useState({
    subjects: [],
    teachers: [],
    weeklyHours: 0
  });

  useEffect(() => {
    console.log('🔄 TimetableManager: Component mounted, fetching timetable...');
    fetchTimetable().then(data => {
      console.log('📋 TimetableManager: Received timetable data:', data);
    }).catch(err => {
      console.log('❌ TimetableManager: Error fetching timetable:', err);
    });
  }, [fetchTimetable]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const slots = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const handleOpenModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        classId: entry.classId,
        subject: entry.subject,
        teacherId: entry.teacherId,
        dayOfWeek: entry.dayOfWeek,
        slot: entry.slot,
        startTime: entry.startTime || '',
        endTime: entry.endTime || '',
        room: entry.room || ''
      });
    } else {
      setEditingEntry(null);
      setFormData({
        classId: '',
        subject: '',
        teacherId: '',
        dayOfWeek: '',
        slot: '',
        startTime: '',
        endTime: '',
        room: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setFormData({
      classId: '',
      subject: '',
      teacherId: '',
      dayOfWeek: '',
      slot: '',
      startTime: '',
      endTime: '',
      room: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        await updateTimetableEntry(editingEntry.timetableId, formData);
      } else {
        await addTimetableEntry(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save timetable entry:', error);
    }
  };

  const handleDelete = async (timetableId) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await deleteTimetableEntry(timetableId);
      } catch (error) {
        console.error('Failed to delete timetable entry:', error);
      }
    }
  };

  const handleGenerateTimetable = async () => {
    try {
      await generateTimetable(generateData);
      setIsGenerateModalOpen(false);
      setGenerateData({ subjects: [], teachers: [], weeklyHours: 0 });
    } catch (error) {
      console.error('Failed to generate timetable:', error);
    }
  };

  const getEntriesForDayAndSlot = (day, slot) => {
    const entries = timetable.filter(entry => entry.dayOfWeek === day && entry.slot === slot);
    console.log(`📋 Filtering entries for ${day} Slot ${slot}:`, entries);
    return entries;
  };

  const getStartTime = (slot) => {
    const times = {
      '1': '09:00', '2': '10:00', '3': '11:00', '4': '12:00',
      '5': '14:00', '6': '15:00', '7': '16:00', '8': '17:00'
    };
    return times[slot] || '09:00';
  };

  const getEndTime = (slot) => {
    const times = {
      '1': '10:00', '2': '11:00', '3': '12:00', '4': '13:00',
      '5': '15:00', '6': '16:00', '7': '17:00', '8': '18:00'
    };
    return times[slot] || '10:00';
  };

  if (loadingTimetable) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timetable Management</h2>
          <p className="text-gray-600">Manage class schedules and generate automated timetables</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <Zap className="h-4 w-4" />
            <span>Auto Generate</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Current Timetable Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Timetable</h3>
            <p className="text-sm text-gray-600 mt-1">
              Multiple sections per time slot are stacked vertically • Total entries: <span className="font-medium text-blue-600">{timetable.length}</span>
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <span>🖨️ Print Timetable</span>
          </button>
        </div>

        {timetable.length > 0 ? (
          <div className="space-y-6">
            {/* Complete Timetable Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Time Slot</th>
                    {days.map(day => (
                      <th key={day} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {slots.map(slot => (
                    <tr key={slot} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300">
                        Slot {slot}<br/>
                        <span className="text-xs text-gray-500">
                          {getStartTime(slot)} - {getEndTime(slot)}
                        </span>
                      </td>
                      {days.map(day => {
                        const entries = getEntriesForDayAndSlot(day, slot);
                        return (
                          <td key={`${day}-${slot}`} className="px-4 py-4 border-r border-gray-300">
                            <div className="space-y-2 min-h-[80px]">
                              {entries.map(entry => (
                                <div
                                  key={entry.timetableId}
                                  className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-sm font-semibold text-blue-900">{entry.subject}</h4>
                                        <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">
                                          {entry.classId}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2 mt-2">
                                        <User className="h-3 w-3 text-blue-600" />
                                        <span className="text-xs text-blue-700 font-medium">{entry.teacherId}</span>
                                      </div>
                                      {entry.room && (
                                        <div className="flex items-center space-x-2 mt-1">
                                          <MapPin className="h-3 w-3 text-green-600" />
                                          <span className="text-xs text-green-700 font-medium">{entry.room}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Clock className="h-3 w-3 text-purple-600" />
                                        <span className="text-xs text-purple-700 font-medium">
                                          {entry.startTime} - {entry.endTime}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex space-x-1 ml-2">
                                      <button
                                        onClick={() => handleOpenModal(entry)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                        title="Edit class"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(entry.timetableId)}
                                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                        title="Delete class"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {entries.length === 0 && (
                                <div className="text-xs text-gray-400 italic py-4 text-center">No class scheduled</div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Complete List View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Timetable List</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {timetable.map(entry => (
                  <div key={entry.timetableId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Subject</span>
                        <p className="text-sm font-semibold text-gray-900">{entry.subject}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Class</span>
                        <p className="text-sm text-gray-700">{entry.classId}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Teacher</span>
                        <p className="text-sm text-gray-700">{entry.teacherId}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Schedule</span>
                        <p className="text-sm text-gray-700">{entry.dayOfWeek} - Slot {entry.slot}</p>
                        <p className="text-xs text-gray-500">{entry.startTime} - {entry.endTime}</p>
                        {entry.room && <p className="text-xs text-gray-500">Room: {entry.room}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No timetable entries found.</p>
            <p className="text-sm text-gray-400">Click "Add Entry" to create your first timetable entry or use "Auto Generate" for quick setup.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-2"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class ID</label>
                  <input
                    type="text"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CSE-A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Data Structures"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher ID</label>
                <input
                  type="text"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., T001"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Day</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slot</label>
                  <select
                    value={formData.slot}
                    onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Slot</option>
                    {slots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room (Optional)</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Room 101"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingEntry ? 'Update' : 'Add'} Entry</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto Generate Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-2"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
                <Zap className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Auto Generate Timetable</h2>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This will clear the existing timetable and generate a new one automatically.
                  Make sure you have teachers and subjects configured properly.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects (JSON format)</label>
                <textarea
                  value={JSON.stringify(generateData.subjects, null, 2)}
                  onChange={(e) => {
                    try {
                      const subjects = JSON.parse(e.target.value);
                      setGenerateData({ ...generateData, subjects });
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-24 font-mono text-xs"
                  placeholder='[{"name": "Data Structures", "classId": "CSE-A", "weeklyHours": 4}]'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teachers (JSON format)</label>
                <textarea
                  value={JSON.stringify(generateData.teachers, null, 2)}
                  onChange={(e) => {
                    try {
                      const teachers = JSON.parse(e.target.value);
                      setGenerateData({ ...generateData, teachers });
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-24 font-mono text-xs"
                  placeholder='[{"teacherId": "T001", "subjects": ["Data Structures", "Algorithms"]}]'
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleGenerateTimetable}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <Zap className="h-4 w-4" />
                  <span>Generate Timetable</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
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

export default TimetableManager;