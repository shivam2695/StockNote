import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/api';

export default function HealthCheck() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [healthData, setHealthData] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<'unknown' | 'authenticated' | 'unauthenticated'>('unknown');
  const [error, setError] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);

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

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setAuthStatus('unauthenticated');
        return;
      }

      await apiService.checkAuthStatus();
      setAuthStatus('authenticated');
    } catch (err) {
      setAuthStatus('unauthenticated');
    }
  };

  useEffect(() => {
    checkHealth();
    checkAuthStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      checkHealth();
      checkAuthStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Auto-hide after 10 seconds if everything is working
  useEffect(() => {
    if (status === 'success' && authStatus !== 'unknown') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [status, authStatus]);

  // Show if there's an error or if manually refreshed
  const shouldShow = isVisible || status === 'error' || status === 'loading';

  if (!shouldShow) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg border hover:shadow-xl transition-all"
        title="Show system status"
      >
        {status === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 min-w-[320px] max-w-[400px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">System Status</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                checkHealth();
                checkAuthStatus();
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              disabled={status === 'loading'}
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Hide status"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Backend Status */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Backend API</div>
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
                  <span className="text-sm font-medium">Online</span>
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
                  <span className="text-sm font-medium">Offline</span>
                </div>
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                  {error}
                </div>
                {error.includes('HTML instead of JSON') && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border flex items-start space-x-2">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Possible causes:</div>
                      <ul className="mt-1 space-y-1">
                        <li>• Backend server is down</li>
                        <li>• Incorrect API URL</li>
                        <li>• CORS configuration issue</li>
                        <li>• Server returning error page</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auth Status */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700">Authentication</div>
            <div className="flex items-center space-x-2">
              <Shield className={`w-4 h-4 ${
                authStatus === 'authenticated' ? 'text-green-600' : 
                authStatus === 'unauthenticated' ? 'text-gray-400' : 'text-blue-600'
              }`} />
              <span className={`text-sm font-medium ${
                authStatus === 'authenticated' ? 'text-green-600' : 
                authStatus === 'unauthenticated' ? 'text-gray-600' : 'text-blue-600'
              }`}>
                {authStatus === 'authenticated' ? 'Authenticated' : 
                 authStatus === 'unauthenticated' ? 'Not Authenticated' : 'Checking...'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            API: {import.meta.env.VITE_API_URL || 'https://stocknote-backend.onrender.com/api'}
          </div>
        </div>
      </div>
    </div>
  );
}