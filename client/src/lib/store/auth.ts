import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../api/auth';
import { storage } from '../storage';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // true once storage has been read
  setUser: (user: User | null) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) => {
    if (user) {
      storage.setJSON('user', user);
    }
    set({ user, isAuthenticated: !!user, isInitialized: true });
  },

  logout: () => {
    authApi.logout();
    set({ user: null, isAuthenticated: false, isInitialized: true });
  },

  initialize: () => {
    // Sync tokens into axios instance first
    apiClient.syncTokensFromStorage();

    try {
      const user = storage.getJSON<User>('user');
      set({ user, isAuthenticated: !!user, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      storage.removeItem('user');
      storage.removeItem('accessToken');
      storage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },
}));
