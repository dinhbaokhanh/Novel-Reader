import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from '../storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    
    // Load tokens from localStorage after interceptors are set up
    this.syncTokensFromStorage();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Always check for fresh token from storage before each request
        const token = this.accessToken || storage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to unwrap data and handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Unwrap data from transform interceptor {data, statusCode, timestamp}
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          response.data = response.data.data;
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Get fresh refresh token from storage
        const currentRefreshToken = this.refreshToken || storage.getItem('refreshToken');

        if (error.response?.status === 401 && !originalRequest._retry && currentRefreshToken) {
          originalRequest._retry = true;

          try {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken: currentRefreshToken,
            });

            // Handle both wrapped and unwrapped responses
            const data = response.data?.data || response.data;
            const { accessToken, refreshToken } = data;
            
            this.setTokens(accessToken, refreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    
    console.log('✅ Tokens set:', { 
      accessToken: accessToken.substring(0, 20) + '...', 
      refreshToken: refreshToken.substring(0, 20) + '...' 
    });
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    storage.removeItem('accessToken');
    storage.removeItem('refreshToken');
    storage.removeItem('user');
    
    console.log('🗑️ Tokens cleared');
  }

  syncTokensFromStorage() {
    this.accessToken = storage.getItem('accessToken');
    this.refreshToken = storage.getItem('refreshToken');
    console.log('🔄 Tokens synced from storage:', {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
    });
  }

  getClient() {
    return this.client;
  }

  isAuthenticated(): boolean {
    // Check both memory and storage
    return !!(this.accessToken || storage.getItem('accessToken'));
  }
}

export const apiClient = new ApiClient();
export const api = apiClient.getClient();
