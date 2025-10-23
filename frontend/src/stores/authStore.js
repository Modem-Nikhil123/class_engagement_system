import { create } from "zustand";
import axios from 'axios';
import toast from "react-hot-toast";

// Import stores for clearing data
import useClassStore from './classStore';
import useReminderStore from './reminderStore';
import useAdminStore from './adminStore';

const useAuthStore = create((set, get) => ({
  user: null,
  isLoggingIn: false,
  isAuthenticated: true,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/check`, {
        withCredentials: true,
      });
      set({ user: res.data }); 
      console.log(get().user);
      
    } catch (error) {

      console.log("Error in checkAuth:", error);
      set({ user: null });

    } finally {
      set({ isCheckingAuth: false });
    }
  },



  login: async (data) => {

    set({ isLoggingIn: true });

    try {

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`,data,{withCredentials:true});

      // Clear previous user data before setting new user
      useClassStore.getState().clearData();
      useReminderStore.getState().clearData();
      useAdminStore.getState().clearData();

      set({ user: res.data });
      console.log(get().user);
      toast.success("Logged in successfully");

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage);
      console.log("Login error:", error);
    } finally {

      set({ isLoggingIn: false });

    }
  },

  logout: async () => {
    try {

      await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`,{
        withCredentials: true,
      });
      set({ user: null });

      // Clear class store and reminder store data on logout
      useClassStore.getState().clearData();
      useReminderStore.getState().clearData();
      useAdminStore.getState().clearData();

      toast.success("Logged out successfully");

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Logout failed";
      toast.error(errorMessage);
      console.log("Logout error:", error);

    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        withCredentials: true,
      });
      
      toast.success("Password changed successfully");
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
      throw error;
    }
  },

}));

export default useAuthStore;