import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface SignUpFormProps {
  onSignUp: (name: string, email: string, password: string) => void;
  onSwitchToLogin: () => void;
}

export default function SignUpForm({ onSignUp, onSwitchToLogin }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSignUp(formData.name.trim(), formData.email.trim(), formData.password);
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
            <button className="text-purple-600 font-bold border-b-2 border-purple-600 pb-1">SIGN UP</button>
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
            
            {/* Document/notepad */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-72 bg-white rounded-2xl shadow-xl transform -rotate-6">
              {/* Document lines */}
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-400 rounded"></div>
                  <div className="w-6 h-6 bg-green-400 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Pencil */}
            <div className="absolute top-8 left-8 w-16 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transform -rotate-45 shadow-lg"></div>
            <div className="absolute top-6 left-6 w-4 h-4 bg-purple-600 rounded-full transform -rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Right side - Sign up form */}
      <div className="w-1/2 flex items-center justify-center p-12 pt-24">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">Sign up</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all ${
                  errors.name ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="Daniel Gallego"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all ${
                  errors.email ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="hello@reallygreatsite.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all pr-10 ${
                      errors.password ? 'ring-2 ring-red-500' : ''
                    }`}
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all pr-10 ${
                      errors.confirmPassword ? 'ring-2 ring-red-500' : ''
                    }`}
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600">or </span>
            <button
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}