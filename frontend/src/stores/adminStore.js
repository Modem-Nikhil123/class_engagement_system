import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:3000/admin";

const useAdminStore = create((set, get) => ({
  // Teachers
  teachers: [],
  loadingTeachers: false,

  // Students
  students: [],
  loadingStudents: false,

  // Timetable
  timetable: [],
  loadingTimetable: false,

  // Queries/Complaints
  queries: [],
  loadingQueries: false,

  // Reports
  substitutionHistory: [],
  classStatusSummary: [],
  loadingReports: false,

  // Clear all data
  clearData: () => {
    set({
      teachers: [],
      students: [],
      timetable: [],
      queries: [],
      substitutionHistory: [],
      classStatusSummary: [],
      loadingTeachers: false,
      loadingStudents: false,
      loadingTimetable: false,
      loadingQueries: false,
      loadingReports: false
    });
  },

  // Teacher Management
  fetchTeachers: async () => {
    set({ loadingTeachers: true });
    try {
      const res = await axios.get(`${API_URL}/teachers`, {
        withCredentials: true,
      });
      set({ teachers: res.data, loadingTeachers: false });
      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch teachers");
      set({ loadingTeachers: false });
      throw error;
    }
  },

  addTeacher: async (teacherData) => {
    try {
      const res = await axios.post(`${API_URL}/teachers`, teacherData, {
        withCredentials: true,
      });
      toast.success("Teacher added successfully");

      // Refresh teachers list
      const { fetchTeachers } = get();
      await fetchTeachers();

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add teacher");
      throw error;
    }
  },

  updateTeacher: async (teacherId, updates) => {
    try {
      const res = await axios.put(`${API_URL}/teachers/${teacherId}`, updates, {
        withCredentials: true,
      });
      toast.success("Teacher updated successfully");

      // Refresh teachers list
      const { fetchTeachers } = get();
      await fetchTeachers();

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update teacher");
      throw error;
    }
  },

  deleteTeacher: async (teacherId) => {
    try {
      await axios.delete(`${API_URL}/teachers/${teacherId}`, {
        withCredentials: true,
      });
      toast.success("Teacher deleted successfully");

      // Refresh teachers list
      const { fetchTeachers } = get();
      await fetchTeachers();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to delete teacher");
      throw error;
    }
  },

  // Student Management
  fetchStudents: async () => {
    set({ loadingStudents: true });
    try {
      const res = await axios.get(`${API_URL}/students`, {
        withCredentials: true,
      });
      set({ students: res.data, loadingStudents: false });
      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch students");
      set({ loadingStudents: false });
      throw error;
    }
  },

  addStudent: async (studentData) => {
    try {
      const res = await axios.post(`${API_URL}/students`, studentData, {
        withCredentials: true,
      });
      toast.success("Student added successfully");

      // Refresh students list
      const { fetchStudents } = get();
      await fetchStudents();

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add student");
      throw error;
    }
  },

  updateStudent: async (studentId, updates) => {
    try {
      const res = await axios.put(`${API_URL}/students/${studentId}`, updates, {
        withCredentials: true,
      });
      toast.success("Student updated successfully");

      // Refresh students list
      const { fetchStudents } = get();
      await fetchStudents();

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update student");
      throw error;
    }
  },

  deleteStudent: async (studentId) => {
    try {
      await axios.delete(`${API_URL}/students/${studentId}`, {
        withCredentials: true,
      });
      toast.success("Student deleted successfully");

      // Refresh students list
      const { fetchStudents } = get();
      await fetchStudents();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to delete student");
      throw error;
    }
  },

  // Timetable Management
  fetchTimetable: async () => {
    console.log('🔄 Fetching timetable...');
    set({ loadingTimetable: true });
    try {
      const res = await axios.get(`${API_URL}/timetable`, {
        withCredentials: true,
      });
      console.log('✅ Timetable data received:', res.data);
      set({ timetable: res.data, loadingTimetable: false });
      return res.data;
    } catch (error) {
      console.log('❌ Error fetching timetable:', error);
      console.log('Error response:', error.response);
      toast.error(error.response?.data?.message || "Failed to fetch timetable");
      set({ loadingTimetable: false });
      throw error;
    }
  },

  addTimetableEntry: async (entryData) => {
    try {
      const res = await axios.post(`${API_URL}/timetable`, entryData, {
        withCredentials: true,
      });
      toast.success("Timetable entry added successfully");

      // Refresh timetable
      const { fetchTimetable } = get();
      await fetchTimetable();

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add timetable entry");
      throw error;
    }
  },

  updateTimetableEntry: async (timetableId, updates) => {
    try {
      const res = await axios.put(`${API_URL}/timetable/${timetableId}`, updates, {
        withCredentials: true,
      });
      toast.success("Timetable entry updated successfully");

      // Refresh timetable
      const { fetchTimetable } = get();
      await fetchTimetable();

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update timetable entry");
      throw error;
    }
  },

  deleteTimetableEntry: async (timetableId) => {
    try {
      await axios.delete(`${API_URL}/timetable/${timetableId}`, {
        withCredentials: true,
      });
      toast.success("Timetable entry deleted successfully");

      // Refresh timetable
      const { fetchTimetable } = get();
      await fetchTimetable();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to delete timetable entry");
      throw error;
    }
  },

  generateTimetable: async (generationData) => {
    try {
      const res = await axios.post(`${API_URL}/timetable/generate`, generationData, {
        withCredentials: true,
      });
      toast.success("Timetable generated successfully");

      // Refresh timetable
      const { fetchTimetable } = get();
      await fetchTimetable();

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to generate timetable");
      throw error;
    }
  },

  // Query/Complaints Management
  fetchQueries: async () => {
    set({ loadingQueries: true });
    try {
      const res = await axios.get(`${API_URL}/queries`, {
        withCredentials: true,
      });
      set({ queries: res.data, loadingQueries: false });
      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch queries");
      set({ loadingQueries: false });
      throw error;
    }
  },

  updateQueryStatus: async (queryId, updates) => {
    try {
      const res = await axios.put(`${API_URL}/queries/${queryId}`, updates, {
        withCredentials: true,
      });
      toast.success("Query status updated successfully");

      // Refresh queries
      const { fetchQueries } = get();
      await fetchQueries();

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update query status");
      throw error;
    }
  },

  // Reports
  fetchSubstitutionHistory: async () => {
    set({ loadingReports: true });
    try {
      const res = await axios.get(`${API_URL}/reports/substitution-history`, {
        withCredentials: true,
      });
      set({ substitutionHistory: res.data, loadingReports: false });
      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch substitution history");
      set({ loadingReports: false });
      throw error;
    }
  },

  fetchClassStatusSummary: async (date) => {
    set({ loadingReports: true });
    try {
      const res = await axios.get(`${API_URL}/reports/class-status-summary`, {
        params: { date },
        withCredentials: true,
      });
      set({ classStatusSummary: res.data, loadingReports: false });
      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch class status summary");
      set({ loadingReports: false });
      throw error;
    }
  }
}));

export default useAdminStore;