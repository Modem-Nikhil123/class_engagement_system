import React, { useState, useEffect, useRef } from 'react';
import useClassStore from '../../stores/classStore';
import { Search, User, Loader2, X } from 'lucide-react';

const TeacherSearchDropdown = ({ onTeacherSelect, selectedTeacher, date, startTime, endTime }) => {
  const { searchTeachers } = useClassStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search teachers with debouncing
  const performSearch = async (query) => {
    if (!query.trim()) {
      setTeachers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = {
        query: query.trim(),
        ...(date && startTime && endTime && {
          date,
          startTime,
          endTime
        })
      };

      const result = await searchTeachers(searchParams);
      setTeachers(result.teachers || []);
    } catch (err) {
      setError('Failed to search teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, date, startTime, endTime]);

  const handleTeacherSelect = (teacher) => {
    onTeacherSelect(teacher);
    setSearchQuery(teacher.name);
    setIsOpen(false);
  };

  const clearSelection = () => {
    onTeacherSelect(null);
    setSearchQuery('');
    setTeachers([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search Substitute Teacher
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by name or department..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {searchQuery && (
          <button
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Searching...</span>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 text-sm text-red-600 bg-red-50">
              {error}
            </div>
          )}

          {!loading && !error && teachers.length === 0 && searchQuery && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No teachers found
            </div>
          )}

          {!loading && teachers.map((teacher) => (
            <div
              key={teacher.teacherId}
              onClick={() => handleTeacherSelect(teacher)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {teacher.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {teacher.department}
                    {teacher.specialization && ` • ${teacher.specialization}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected teacher display */}
      {selectedTeacher && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {selectedTeacher.name}
              </p>
              <p className="text-xs text-blue-700">
                {selectedTeacher.department}
                {selectedTeacher.specialization && ` • ${selectedTeacher.specialization}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSearchDropdown;