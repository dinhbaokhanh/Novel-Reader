import { api, apiClient } from './client';
import { AuthResponse, LoginDto, RegisterDto } from '../types';
import { storage } from '../storage';

export const authApi = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const authData = response.data; // Already unwrapped by interceptor
    
    apiClient.setTokens(authData.accessToken, authData.refreshToken);
    storage.setJSON('user', authData.user);
    
    return authData;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    const authData = response.data; // Already unwrapped by interceptor
    
    apiClient.setTokens(authData.accessToken, authData.refreshToken);
    storage.setJSON('user', authData.user);
    
    return authData;
  },

  logout() {
    apiClient.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  getCurrentUser() {
    return storage.getJSON('user');
  },
};
