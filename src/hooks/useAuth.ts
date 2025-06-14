import { useState, useEffect } from 'react';
import { AuthState, User } from '../types/Auth';
import { apiService } from '../services/api';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          // Verify token with backend
          const response = await apiService.getUserProfile();
          if (response.success && response.data.user) {
            setAuthState({
              isAuthenticated: true,
              user: response.data.user,
            });
          } else {
            // Invalid token, clear it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const response = await apiService.signup(name, email, password);
      
      if (response.success) {
        // For signup, we might need email verification
        if (response.data.requiresEmailVerification) {
          return { requiresVerification: true, email };
        }
        
        // If no verification needed, auto-login
        if (response.data.user) {
          setAuthState({
            isAuthenticated: true,
            user: response.data.user,
          });
        }
      }
      
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data.user) {
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
        });
        
        return response;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const verifyEmail = async (email: string, token: string) => {
    try {
      const response = await apiService.verifyEmail(email, token);
      
      if (response.success && response.data.user) {
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
        });
      }
      
      return response;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
      });
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await apiService.updateUserProfile(profileData);
      
      if (response.success && response.data.user) {
        setAuthState(prev => ({
          ...prev,
          user: response.data.user,
        }));
      }
      
      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return {
    ...authState,
    loading,
    signUp,
    login,
    verifyEmail,
    logout,
    updateProfile,
  };
};