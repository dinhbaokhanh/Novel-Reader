'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { apiClient } from '@/lib/api/client';

export default function TestPage() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    const accessToken = storage.getItem('accessToken');
    const refreshToken = storage.getItem('refreshToken');
    const user = storage.getJSON('user');
    const isAuth = apiClient.isAuthenticated();

    setInfo({
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null',
      user: user,
      isAuthenticated: isAuth,
    });
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Auth Debug Info
        </h1>
        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(info, null, 2)}
        </pre>
        
        <div className="mt-4 space-y-2">
          <button
            onClick={() => {
              const newInfo = {
                accessToken: storage.getItem('accessToken'),
                refreshToken: storage.getItem('refreshToken'),
                user: storage.getJSON('user'),
                isAuthenticated: apiClient.isAuthenticated(),
              };
              console.log('Current state:', newInfo);
              setInfo(newInfo);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Info
          </button>
          
          <button
            onClick={() => {
              storage.clear();
              window.location.reload();
            }}
            className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Storage & Reload
          </button>
        </div>
      </div>
    </div>
  );
}
