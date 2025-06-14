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
  const [pendingSignUp, setPendingSignUp] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    try {
      setError('');
      await onLogin(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleSignUpRequest = async (name: string, email: string, password: string) => {
    try {
      setError('');
      const result = await onSignUp(name, email, password);
      
      if (result?.requiresVerification) {
        setPendingSignUp({ name, email, password });
        setCurrentView('otp');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign up failed');
    }
  };

  const handleOTPVerified = async () => {
    // OTP verification is handled in the backend
    // User should be automatically logged in after verification
    setPendingSignUp(null);
    setCurrentView('login');
  };

  const handleBackToSignUp = () => {
    setPendingSignUp(null);
    setCurrentView('signup');
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

  if (currentView === 'otp' && pendingSignUp) {
    return (
      <OTPVerification
        email={pendingSignUp.email}
        onVerified={handleOTPVerified}
        onBack={handleBackToSignUp}
        purpose="signup"
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