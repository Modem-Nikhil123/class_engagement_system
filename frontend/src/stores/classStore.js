import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:3000/class";
const SUBSTITUTE_API_URL = "http://localhost:3000/substitute";
let lastFetchedDate = null;
const useClassStore = create((set, get) => ({
  classSlots: [],
  queries: [],
  substituteRequests: [],
  loading: false,
  submittingQuery: false,
  markingAbsent: false,
  loadingSubstituteRequests: false,

  // Clear all data (used when user logs out or switches)
  clearData: () => {
    lastFetchedDate = null; // Reset global variable
    set({
      classSlots: [],
      queries: [],
      substituteRequests: [],
      loading: false,
      submittingQuery: false,
      markingAbsent: false,
      loadingSubstituteRequests: false
    });
  },

  // Update class slot status locally (for instant UI updates)
  updateClassSlotStatus: (updateData) => {
    set((state) => ({
      classSlots: state.classSlots.map(slot => {
        // Match by classId, date, subject, startTime, endTime
        if (slot.classId === updateData.classId &&
            slot.date === updateData.date &&
            slot.subject === updateData.subject &&
            slot.startTime === updateData.startTime &&
            slot.endTime === updateData.endTime) {
          return {
            ...slot,
            ...updateData
          };
        }
        return slot;
      })
    }));
  },

  // Fetch class schedule with status
  fetchClassSchedule:  async (userId, role, dates) => {
    const dateObj = dates ? new Date(dates) : new Date();
    const date = dateObj.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD (locale-specific)

    if (lastFetchedDate === date) return; // Prevent fetching same date again

    lastFetchedDate = date;
    set({ loading: true});

    try {
      const res = await axios.get(`${API_URL}/schedule`,{
        params: { userId, role, date},
        withCredentials: true,
      });

      set({ classSlots: res.data, loading: false });
      return res.data; // Return the data
    } catch (error) {
      console.error('Error fetching class schedule:', error);
      set({ loading: false });
      throw error; // Re-throw the error
      }
    },

  // Update class status (Teacher functionality)
  updateClassStatus: async (statusData) => {
    try {
      const res = await axios.post(`${API_URL}/update-status`, statusData, {
        withCredentials: true,
      });
      toast.success("Class status updated successfully");
      
      // Refresh the schedule
      const { fetchClassSchedule } = get();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.userId) {
        fetchClassSchedule(currentUser.userId, currentUser.role);
      }
      
      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update class status");
      throw error;
    }
  },

  // Mark teacher as absent (Student functionality)
  markTeacherAbsent: async (absentData) => {
    set({ markingAbsent: true });
    try {
      const res = await axios.post(`${API_URL}/mark-absent`, absentData, {
        withCredentials: true,
      });
      toast.success("Teacher absence reported successfully");
      
      // Refresh the schedule
      const { fetchClassSchedule } = get();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.userId) {
        fetchClassSchedule(currentUser.userId, currentUser.role);
      }
      
      set({ markingAbsent: false });
      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to report teacher absence");
      set({ markingAbsent: false });
      throw error;
    }
  },

  // Submit query/complaint (Student functionality)
  submitQuery: async (queryData) => {
    set({ submittingQuery: true });
    try {
      const res = await axios.post(`${API_URL}/submit-query`, queryData, {
        withCredentials: true,
      });
      toast.success("Query submitted successfully");
      
      // Refresh queries
      const { fetchStudentQueries } = get();
      fetchStudentQueries();
      
      set({ submittingQuery: false });
      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to submit query");
      set({ submittingQuery: false });
      throw error;
    }
  },

  // Fetch student queries
  fetchStudentQueries: async () => {
    try {
      const res = await axios.get(`${API_URL}/my-queries`, {
        withCredentials: true,
      });
      set({ queries: res.data });
      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch queries");
      throw error;
    }
  },

  // Teacher response to absence report
  respondToAbsenceReport: async (responseData) => {
    try {
      const res = await axios.post(`${API_URL}/respond-absence`, responseData, {
        withCredentials: true,
      });
      toast.success("Response recorded successfully");

      // Refresh the schedule
      const { fetchClassSchedule } = get();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.userId) {
        fetchClassSchedule(currentUser.userId, currentUser.role);
      }

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to record response");
      throw error;
    }
  },

  // Create substitute request
  createSubstituteRequest: async (requestData) => {
    try {
      const res = await axios.post(`${SUBSTITUTE_API_URL}/create`, requestData, {
        withCredentials: true,
      });
      toast.success("Substitute request created and notifications sent to available teachers");

      // Refresh the schedule
      const { fetchClassSchedule } = get();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.userId) {
        fetchClassSchedule(currentUser.userId, currentUser.role);
      }

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create substitute request");
      throw error;
    }
  },

  // Fetch substitute requests for teacher
  fetchSubstituteRequests: async () => {
    set({ loadingSubstituteRequests: true });
    try {
      const res = await axios.get(`${SUBSTITUTE_API_URL}/available`, {
        withCredentials: true,
      });
      set({ substituteRequests: res.data, loadingSubstituteRequests: false });
      

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch substitute requests");
      set({ loadingSubstituteRequests: false });
      throw error;
    }
  },

  // Accept substitute request
  acceptSubstituteRequest: async (requestId) => {
    try {
      const res = await axios.put(`${SUBSTITUTE_API_URL}/${requestId}/accept`, {}, {
        withCredentials: true,
      });
      toast.success("Substitute request accepted successfully");

      // Refresh substitute requests and schedule
      const { fetchSubstituteRequests, fetchClassSchedule } = get();
      await fetchSubstituteRequests();

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.userId) {
        fetchClassSchedule(currentUser.userId, currentUser.role);
      }

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to accept substitute request");
      throw error;
    }
  },

  // Decline substitute request
  declineSubstituteRequest: async (requestId) => {
    try {
      const res = await axios.put(`${SUBSTITUTE_API_URL}/${requestId}/decline`, {}, {
        withCredentials: true,
      });
      toast.success("Substitute request declined");

      // Refresh substitute requests
      const { fetchSubstituteRequests } = get();
      await fetchSubstituteRequests();

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to decline substitute request");
      throw error;
    }
  }
}));

export default useClassStore;
