import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
  purpose: 'signup' | 'forgot-password';
}

export default function OTPVerification({ email, onVerified, onBack, purpose }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Generate and store OTP
  const generateOTP = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`otp_${email}`, newOTP);
    localStorage.setItem(`otp_expiry_${email}`, (Date.now() + 300000).toString()); // 5 minutes
    
    // Simulate sending email (in real app, this would be an API call)
    console.log(`OTP for ${email}: ${newOTP}`);
    alert(`OTP sent to ${email}: ${newOTP} (Check console for development)`);
    
    return newOTP;
  };

  useEffect(() => {
    // Generate OTP when component mounts
    generateOTP();
  }, [email]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOTP = otp.join('');
    
    if (enteredOTP.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      const storedOTP = localStorage.getItem(`otp_${email}`);
      const expiryTime = localStorage.getItem(`otp_expiry_${email}`);
      
      if (!storedOTP || !expiryTime) {
        setError('OTP expired. Please request a new one.');
        setIsLoading(false);
        return;
      }

      if (Date.now() > parseInt(expiryTime)) {
        setError('OTP expired. Please request a new one.');
        localStorage.removeItem(`otp_${email}`);
        localStorage.removeItem(`otp_expiry_${email}`);
        setCanResend(true);
        setIsLoading(false);
        return;
      }

      if (enteredOTP === storedOTP) {
        // OTP verified successfully
        localStorage.removeItem(`otp_${email}`);
        localStorage.removeItem(`otp_expiry_${email}`);
        onVerified();
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleResendOTP = () => {
    generateOTP();
    setTimeLeft(300);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl transform rotate-6 opacity-20"></div>
          <div className="relative bg-white rounded-3xl p-12 shadow-2xl">
            <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
              <Mail className="w-32 h-32 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - OTP form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/Black White Minimalist Fierce Bull Logo.png" 
                alt="StockNote Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to <span className="font-semibold">{email}</span>
            </p>
          </div>

          <div className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-xl font-bold border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                ))}
              </div>
              {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expires in <span className="font-semibold text-purple-600">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600">Code expired</p>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResendOTP}
                  className="text-purple-600 hover:text-purple-500 font-medium flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Code</span>
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Didn't receive the code? You can resend in {formatTime(timeLeft)}
                </p>
              )}
            </div>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {purpose === 'signup' ? 'Sign Up' : 'Login'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}