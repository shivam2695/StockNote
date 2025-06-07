import { useState, useEffect } from 'react';
import { AuthState, User } from '../types/Auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('authState');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setAuthState(parsedAuth);
      } catch (error) {
        console.error('Failed to parse saved auth state:', error);
        localStorage.removeItem('authState');
      }
    }
  }, []);

  // Save authentication state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('authState', JSON.stringify(authState));
  }, [authState]);

  const login = (email: string, name: string) => {
    const user: User = { email, name };
    setAuthState({
      isAuthenticated: true,
      user,
    });
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
    // Clear auth state but keep user-specific data
    localStorage.removeItem('authState');
  };

  const clearUserData = (userEmail: string) => {
    // Clear all user-specific data when needed
    localStorage.removeItem(`stockRecordsTrades_${userEmail}`);
    localStorage.removeItem(`stockRecordsFocusStocks_${userEmail}`);
  };

  return {
    ...authState,
    login,
    logout,
    clearUserData,
  };
};