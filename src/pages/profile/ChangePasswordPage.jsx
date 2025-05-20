import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Eye, EyeOff, Check, X, Save, ArrowLeft } from 'lucide-react';
import { useChangePassword } from '../../apis/users/hooks';
import { toast } from 'react-toastify';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Password state
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });
  
  // Setup mutation
  const changePasswordMutation = useChangePassword({
    onSuccess: () => {
      toast.success('Password changed successfully');
      navigate('/profile');
    },
    onError: (error) => {
      if (error.message.includes('incorrect password')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast.error(`Error changing password: ${error.message}`);
      }
    }
  });
  
  // Password requirements
  const passwordRequirements = [
    {
      id: 'length',
      label: 'At least 8 characters',
      test: (password) => password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter',
      test: (password) => /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter',
      test: (password) => /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'At least one number',
      test: (password) => /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'At least one special character',
      test: (password) => /[^A-Za-z0-9]/.test(password),
    },
  ];
  
  // Calculate password strength whenever password changes
  useEffect(() => {
    const { newPassword } = formData;
    
    // Count how many requirements are met
    const requirementsMet = passwordRequirements.filter(req => 
      req.test(newPassword)
    ).length;
    
    // Calculate score (0 to 100)
    const score = (requirementsMet / passwordRequirements.length) * 100;
    
    // Set feedback based on score
    let feedback = '';
    if (score === 0) {
      feedback = '';
    } else if (score < 40) {
      feedback = 'Weak password';
    } else if (score < 80) {
      feedback = 'Moderate password';
    } else {
      feedback = 'Strong password';
    }
    
    setPasswordStrength({ score, feedback });
  }, [formData.newPassword]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation errors when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    const { currentPassword, newPassword, confirmPassword } = formData;
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      // Check password strength
      const failedRequirements = passwordRequirements.filter(
        req => !req.test(newPassword)
      );
      
      if (failedRequirements.length > 0) {
        newErrors.newPassword = 'Password does not meet all requirements';
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    changePasswordMutation.mutate({ 
      newPassword: formData.newPassword 
    });
  };
  
  // Helper to get strength color
  const getStrengthColor = () => {
    const { score } = passwordStrength;
    
    if (score === 0) return 'bg-gray-200';
    if (score < 40) return 'bg-red-500';
    if (score < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center border-b border-gray-200 pb-4 mb-6">
        <button 
          onClick={() => navigate('/profile')} 
          className="mr-3 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  className={`block w-full px-4 py-2 border ${errors.currentPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  className={`block w-full px-4 py-2 border ${errors.newPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
              )}
              
              {/* Password Strength Meter */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getStrengthColor()}`} 
                      style={{ width: `${passwordStrength.score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{passwordStrength.feedback}</p>
                </div>
              )}
              
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req) => (
                  <div key={req.id} className="flex items-center text-xs">
                    {req.test(formData.newPassword) ? (
                      <Check className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <X className="h-3 w-3 text-gray-300 mr-1" />
                    )}
                    <span
                      className={
                        req.test(formData.newPassword)
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`block w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </button>
            <button
              type="submit"
              disabled={changePasswordMutation.isLoading}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {changePasswordMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;