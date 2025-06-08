import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

interface AuthContainerProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (name: string, email: string, password: string) => void;
}

export default function AuthContainer({ onLogin, onSignUp }: AuthContainerProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleLogin = async (email: string, password: string) => {
    try {
      await onLogin(email, password);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    try {
      await onSignUp(name, email, password);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Sign up failed');
    }
  };

  if (isLoginMode) {
    return (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToSignUp={() => setIsLoginMode(false)}
      />
    );
  }

  return (
    <SignUpForm
      onSignUp={handleSignUp}
      onSwitchToLogin={() => setIsLoginMode(true)}
    />
  );
}