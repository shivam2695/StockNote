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

  const signUp = (name: string, email: string, password: string) => {
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('stockNoteUsers') || '[]');
    const userExists = existingUsers.find((user: any) => user.email === email);
    
    if (userExists) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = { name, email, password };
    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem('stockNoteUsers', JSON.stringify(updatedUsers));

    // Auto-login after signup
    const user: User = { email, name };
    setAuthState({
      isAuthenticated: true,
      user,
    });
  };

  const login = (email: string, password: string) => {
    // Check credentials
    const existingUsers = JSON.parse(localStorage.getItem('stockNoteUsers') || '[]');
    const user = existingUsers.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const authenticatedUser: User = { email: user.email, name: user.name };
    setAuthState({
      isAuthenticated: true,
      user: authenticatedUser,
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
    signUp,
    login,
    logout,
    clearUserData,
  };
};