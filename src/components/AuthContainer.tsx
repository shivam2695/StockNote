import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import OTPVerification from './OTPVerification';
import ForgotPassword from './ForgotPassword';

interface AuthContainerProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<any>;
}

export default function AuthContainer({ onLogin, onSignUp }: AuthContainerProps) {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'otp' | 'forgot-password'>('login');
  const [pendingVerification, setPendingVerification] = useState<{
    email: string;
    fromLogin?: boolean;
  } | null>(null);
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    try {
      setError('');
      await onLogin(email, password);
    } catch (error: any) {
      if (error.requiresEmailVerification) {
        setPendingVerification({ email, fromLogin: true });
        setCurrentView('otp');
      } else {
        setError(error.message || 'Login failed');
      }
    }
  };

  const handleSignUpRequest = async (name: string, email: string, password: string) => {
    try {
      setError('');
      const result = await onSignUp(name, email, password);
      
      if (result?.requiresEmailVerification) {
        setPendingVerification({ email, fromLogin: false });
        setCurrentView('otp');
      }
    } catch (error: any) {
      setError(error.message || 'Sign up failed');
    }
  };

  const handleOTPVerified = async () => {
    // After OTP verification, user should be automatically logged in
    setPendingVerification(null);
    setCurrentView('login');
  };

  const handleBackFromOTP = () => {
    setPendingVerification(null);
    if (pendingVerification?.fromLogin) {
      setCurrentView('login');
    } else {
      setCurrentView('signup');
    }
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setError('');
  };

  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
    setError('');
  };

  const handlePasswordReset = () => {
    setCurrentView('login');
    setError('');
  };

  if (currentView === 'otp' && pendingVerification) {
    return (
      <OTPVerification
        email={pendingVerification.email}
        onVerified={handleOTPVerified}
        onBack={handleBackFromOTP}
        purpose={pendingVerification.fromLogin ? 'login' : 'signup'}
      />
    );
  }

  if (currentView === 'forgot-password') {
    return (
      <ForgotPassword
        onBack={handleBackToLogin}
        onPasswordReset={handlePasswordReset}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignUpForm
        onSignUp={handleSignUpRequest}
        onSwitchToLogin={() => setCurrentView('login')}
        error={error}
      />
    );
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      onSwitchToSignUp={() => setCurrentView('signup')}
      onForgotPassword={handleForgotPassword}
      error={error}
    />
  );
}