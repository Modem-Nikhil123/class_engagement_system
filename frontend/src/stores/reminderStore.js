import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/reminders`;
let lastFetchedRemainder=null;
const useReminderStore = create((set, get) => ({
  reminders: [],
  loading: false,

  // Clear all data (used when user logs out or switches)
  clearData: () => {
    console.log('Clearing reminder store data');
    lastFetchedRemainder = null; // Reset global variable
    set({
      reminders: [],
      loading: false
    });
  },

  // Fetch reminders for a teacher
  fetchReminders: async (teacherId) => {
    // Prevent multiple simultaneous fetches
    const currentState = get();
    if (currentState.loading) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    if(lastFetchedRemainder==teacherId) return;

    lastFetchedRemainder=teacherId;

    set({ loading: true});
    try {
      console.log('Fetching reminders for teacher:', teacherId);
      const res = await axios.get(`${API_URL}/teacher/${teacherId}`, {
        withCredentials: true,
        validateStatus: (status) => {
          return status >= 200 && status < 300; // Prevents errors for non-2xx responses
        },
      });
      
      if (!res.data) {
        console.warn('No data returned from API');
        set({ reminders: [], loading: false });
        return;
      }

      console.log('Received reminders:', res.data);
      // Only update if data has actually changed
      const currentState = get();
      const hasChanged = JSON.stringify(currentState.reminders) !== JSON.stringify(res.data);
      if (hasChanged) {
        set({ reminders: res.data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      console.log('Full error details:', {
        message: error.message,
        response: error.response ? error.response.data : null,
        config: error.config,
      });

      let errorMessage = "Failed to fetch reminders. Please try again later.";
      if (error.response && error.response.status) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Unauthorized access. Please log in again.";
            break;
          case 404:
            errorMessage = "No reminders found for this teacher.";
            break;
          default:
            errorMessage = `Server error (${error.response.status}). Please try again later.`;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      toast.error(errorMessage);
      set({ loading: false });
    }
  },

  // Create a new reminder
  createReminder: async ({ teacherId, title, time, date, description }) => {
    try {
      const res = await axios.post(API_URL, { teacherId, title, time, date: new Date(date), description }, {
        withCredentials: true,
      });
      toast.success("Reminder created successfully");

      // Add to local state immediately
      const currentState = get();
      const newReminder = res.data.reminder || res.data;
      const updatedReminders = [...currentState.reminders, newReminder];
      set({ reminders: updatedReminders });

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error("Failed to create reminder");
      throw error;
    }
  },

  // Update reminder
  updateReminder: async (reminderId, updateData) => {
    try {
      const res = await axios.put(`${API_URL}/${reminderId}`, { ...updateData, date: new Date(updateData.date) }, {
        withCredentials: true,
      });
      toast.success("Reminder updated successfully");

      // Update local state immediately
      const currentState = get();
      const updatedReminders = currentState.reminders.map(reminder =>
        reminder._id === reminderId
          ? { ...reminder, ...updateData, date: updateData.date }
          : reminder
      );
      set({ reminders: updatedReminders });

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error("Failed to update reminder");
      throw error;
    }
  },

  // Delete reminder
  deleteReminder: async (reminderId) => {
    try {
      await axios.delete(`${API_URL}/${reminderId}`, {
        withCredentials: true,
      });
      toast.success("Reminder deleted successfully");

      // Remove from local state immediately
      const currentState = get();
      const updatedReminders = currentState.reminders.filter(reminder => reminder._id !== reminderId);
      set({ reminders: updatedReminders });
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete reminder");
      throw error;
    }
  },

  // Toggle reminder active status
  toggleReminder: async (reminderId) => {
    try {
      const res = await axios.patch(`${API_URL}/${reminderId}/toggle`, {}, {
        withCredentials: true,
      });

      toast.success("Reminder status updated successfully");

      // Update local state immediately
      const currentState = get();
      const updatedReminders = currentState.reminders.map(reminder =>
        reminder._id === reminderId
          ? { ...reminder, isCompleted: !reminder.isCompleted }
          : reminder
      );
      set({ reminders: updatedReminders });

      return res.data;
    } catch (error) {
      console.log(error);
      toast.error("Failed to toggle reminder");
      throw error;
    }
  }
}));

export default useReminderStore;