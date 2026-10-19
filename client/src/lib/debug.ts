/**
 * Debug utilities for development
 */

export const debug = {
  auth: {
    logState() {
      if (typeof window === 'undefined') return;
      
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const user = localStorage.getItem('user');
      
      console.group('🔐 Auth State');
      console.log('Access Token:', accessToken ? `${accessToken.substring(0, 30)}...` : 'null');
      console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 30)}...` : 'null');
      console.log('User:', user ? JSON.parse(user) : 'null');
      console.groupEnd();
    },
    
    clearAll() {
      if (typeof window === 'undefined') return;
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      console.log('🗑️ All auth data cleared');
    }
  },
  
  api: {
    testEndpoint: async (url: string) => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.group(`🌐 API Test: ${url}`);
        console.log('Status:', response.status);
        console.log('Token used:', accessToken ? `${accessToken.substring(0, 30)}...` : 'null');
        
        if (response.ok) {
          const data = await response.json();
          console.log('Response:', data);
        } else {
          const error = await response.text();
          console.error('Error:', error);
        }
        console.groupEnd();
      } catch (error) {
        console.error('Request failed:', error);
      }
    }
  }
};

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debug = debug;
  console.log('💡 Debug utils available: window.debug');
}
