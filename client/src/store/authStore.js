import { create } from 'zustand';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('nexus_user')) || null,
  token: localStorage.getItem('nexus_token') || null,
  isAuthenticated: !!localStorage.getItem('nexus_token'),
  loading: false,

  register: async (data) => {
    set({ loading: true });
    try {
      const res = await authAPI.register(data);
      const { token, user } = res.data;
      localStorage.setItem('nexus_token', token);
      localStorage.setItem('nexus_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      toast.success('Welcome to NEXUS! 🎉');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      set({ loading: false });
      return false;
    }
  },

  login: async (data) => {
    set({ loading: true });
    try {
      const res = await authAPI.login(data);
      const { token, user } = res.data;
      localStorage.setItem('nexus_token', token);
      localStorage.setItem('nexus_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      set({ loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    set({ user: null, token: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  updateUser: async (userData) => {
    try {
      const res = await authAPI.updateProfile(userData);
      const updatedUser = res.data.user || { ...get().user, ...userData };
      localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      toast.success('Profile updated');
    } catch (error) {
      // Fallback: update locally
      const updatedUser = { ...get().user, ...userData };
      localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  fetchUser: async () => {
    try {
      const res = await authAPI.getMe();
      const user = res.data.user;
      localStorage.setItem('nexus_user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      // Silently fail
    }
  }
}));

export default useAuthStore;
