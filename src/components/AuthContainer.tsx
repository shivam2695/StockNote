import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import OTPVerification from './OTPVerification';
import ForgotPassword from './ForgotPassword';

interface AuthContainerProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (name: string, email: string, password: string) => void;
}

export default function AuthContainer({ onLogin, onSignUp }: AuthContainerProps) {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'otp' | 'forgot-password'>('login');
  const [pendingSignUp, setPendingSignUp] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      await onLogin(email, password);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleSignUpRequest = async (name: string, email: string, password: string) => {
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('stockNoteUsers') || '[]');
      const userExists = existingUsers.find((user: any) => user.email === email);
      
      if (userExists) {
        throw new Error('User with this email already exists');
      }

      // Store pending signup data
      setPendingSignUp({ name, email, password });
      setCurrentView('otp');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Sign up failed');
    }
  };

  const handleOTPVerified = async () => {
    if (pendingSignUp) {
      try {
        await onSignUp(pendingSignUp.name, pendingSignUp.email, pendingSignUp.password);
        setPendingSignUp(null);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Sign up failed');
      }
    }
  };

  const handleBackToSignUp = () => {
    setPendingSignUp(null);
    setCurrentView('signup');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handlePasswordReset = () => {
    setCurrentView('login');
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
      />
    );
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      onSwitchToSignUp={() => setCurrentView('signup')}
      onForgotPassword={handleForgotPassword}
    />
  );
}