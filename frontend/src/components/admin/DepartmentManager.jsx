import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users } from 'lucide-react';

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({
    departmentId: '',
    name: '',
    description: ''
  });
  const [assignData, setAssignData] = useState({
    departmentId: '',
    teacherId: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchTeachers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:3000/admin/departments', { withCredentials: true });
      setDepartments(res.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/admin/teachers', { withCredentials: true });
      setTeachers(res.data);
    } catch (error) {
      console.error('Failed to fetch teachers');
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/admin/departments', formData, { withCredentials: true });
      toast.success('Department added successfully');
      setShowAddModal(false);
      setFormData({ departmentId: '', name: '', description: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add department');
    }
  };

  const handleAssignHOD = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/admin/departments/assign-hod', assignData, { withCredentials: true });
      toast.success('HOD assigned successfully');
      setShowAssignModal(false);
      setAssignData({ departmentId: '', teacherId: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign HOD');
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/admin/departments/${departmentId}`, { withCredentials: true });
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
        <div className="space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Department</span>
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Assign HOD</span>
          </button>
        </div>
      </div>

      {/* Departments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
              <span className="text-sm text-gray-500">ID: {dept.departmentId}</span>
            </div>
            <p className="text-gray-600 mb-4">{dept.description || 'No description'}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">HOD:</p>
                <p className="font-medium">{dept.hod?.name || 'Not assigned'}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleDeleteDepartment(dept.departmentId)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No departments found.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Add your first department →
          </button>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
            <form onSubmit={handleAddDepartment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department ID</label>
                  <input
                    type="text"
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., CSE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Computer Science Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign HOD Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign HOD</h3>
            <form onSubmit={handleAssignHOD}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    required
                    value={assignData.departmentId}
                    onChange={(e) => setAssignData({...assignData, departmentId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.departmentId}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teacher</label>
                  <select
                    required
                    value={assignData.teacherId}
                    onChange={(e) => setAssignData({...assignData, teacherId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher.teacherId}>{teacher.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Assign HOD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}