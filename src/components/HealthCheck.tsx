import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export default function HealthCheck() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const checkHealth = async () => {
    try {
      setStatus('loading');
      setError('');
      
      const data = await apiService.healthCheck();
      setHealthData(data);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
      setStatus('error');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 min-w-[300px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Backend Status</h3>
          <button
            onClick={checkHealth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={status === 'loading'}
          >
            <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2">
          {status === 'loading' && (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Checking backend...</span>
            </div>
          )}

          {status === 'success' && healthData && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Backend Online</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Status: {healthData.status}</div>
                <div>Version: {healthData.version}</div>
                <div>Environment: {healthData.environment}</div>
                <div>Time: {new Date(healthData.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Backend Offline</span>
              </div>
              <div className="text-xs text-red-600">
                {error}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            URL: https://stocknote-backend.onrender.com
          </div>
        </div>
      </div>
    </div>
  );
}