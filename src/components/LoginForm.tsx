import React, { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToSignUp: () => void;
}

export default function LoginForm({ onLogin, onSwitchToSignUp }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onLogin(formData.email.trim(), formData.password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between p-6">
          <div className="text-2xl font-bold text-purple-600">StockNote</div>
          <div className="flex items-center space-x-8">
            <button className="text-gray-600 hover:text-gray-900 font-medium">HOME</button>
            <button className="text-gray-600 hover:text-gray-900 font-medium">ABOUT US</button>
            <button className="text-gray-600 hover:text-gray-900 font-medium">CONTACT</button>
            <button className="text-purple-600 font-bold border-b-2 border-purple-600 pb-1">LOG IN</button>
          </div>
        </div>
      </div>

      {/* Left side - Illustration */}
      <div className="w-1/2 flex items-center justify-center p-12 pt-24">
        <div className="relative">
          {/* 3D Illustration placeholder */}
          <div className="w-96 h-96 relative">
            {/* Purple base */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl transform rotate-12 shadow-2xl"></div>
            
            {/* Document/notepad with lock */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-72 bg-white rounded-2xl shadow-xl transform -rotate-6">
              {/* Lock icon on document */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              {/* Document lines */}
              <div className="p-6 pt-16 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-400 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Lock */}
            <div className="absolute top-16 left-16 w-16 h-20 bg-yellow-400 rounded-t-xl rounded-b-lg shadow-lg">
              <div className="w-8 h-8 border-4 border-yellow-600 rounded-full mx-auto mt-2"></div>
            </div>
            
            {/* Key */}
            <div className="absolute bottom-16 right-16 w-12 h-12 bg-yellow-400 rounded-full shadow-lg">
              <div className="absolute top-1/2 right-0 w-8 h-2 bg-yellow-400 transform -translate-y-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-1/2 flex items-center justify-center p-12 pt-24">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">Log in</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all ${
                    errors.email ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Username"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-400 rounded flex items-center justify-center">
                  <div className="w-2 h-3 bg-white rounded-sm"></div>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all ${
                    errors.password ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-gray-600">
                  Remember Me
                </label>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600">or </span>
            <button
              onClick={onSwitchToSignUp}
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}