import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
// import apiService from '../../utils/apiService'; // Removed apiService import
import { useAuth } from '../../contexts/auth/AuthContext'; // Import useAuth

const Signup = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth(); // Get register function from context
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient', // Default role
    referralCode: '', // Added referral code state
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    // Clear form-level error on any input change
    if (errors.form) {
      setErrors((prev) => ({ ...prev, form: null }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password strength indicators
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else {
      const failedRequirements = passwordRequirements.filter(
        (req) => !req.test(formData.password)
      );
      if (failedRequirements.length > 0)
        newErrors.password = 'Password does not meet all requirements';
    }
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Clear previous form errors

    // Prepare payload, excluding confirmPassword
    const { confirmPassword, referralCode, ...basePayload } = formData;
    const payload = { ...basePayload };

    // Only include referralCode if it's not empty
    if (referralCode && referralCode.trim() !== '') {
      payload.referralCode = referralCode.trim();
    }

    try {
      // Use the register function from AuthContext
      const { success, error: registrationError, user, session } = await registerUser(
        payload.email,
        payload.password,
        {
          data: { // Supabase uses 'data' for metadata
            first_name: payload.firstName,
            last_name: payload.lastName,
            role: payload.role, // Include role in metadata
            // referral_code: payload.referralCode, // Include referral code if needed
          },
          // You might need to configure email confirmation redirect URL here if needed
          // options: { emailRedirectTo: '...' }
        }
      );

      if (!success) {
        throw new Error(registrationError || 'Registration failed');
      }

      // Handle successful registration (e.g., navigate or show message)
      // Check if email confirmation is needed (user exists but no session)
      if (user && !session) {
         // Navigate to login with a message prompting email check
         navigate('/login', {
           state: { message: 'Registration successful! Please check your email to confirm your account before logging in.' },
         });
      } else {
         // If session exists (auto-login or no confirmation needed), navigate to dashboard or login
         navigate('/login', {
           state: { message: 'Account created successfully! Please log in.' },
         });
      }

      // Reset form (optional, as we navigate away)
      // setFormData({ ...initial state... });

      // Navigate to login page with success message
      navigate('/login', {
        state: { message: 'Account created successfully! Please log in.' },
      });
    } catch (error) {
      console.error('Registration error:', error);
      // Display specific error from Supabase or generic message
      setErrors({
        form: error.message || 'Registration failed. Please check your details or try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent1/10 via-white to-accent2/10 relative">
      {/* Decorative floating elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent3/20 rounded-full blur-2xl -z-10" />
      <div className="max-w-3xl w-full bg-white/90 rounded-2xl shadow-2xl overflow-hidden px-8 py-6 border border-gray-100 backdrop-blur-md">
        <div className="text-center mb-4">
          <span className="mx-auto mb-2 flex items-center justify-center w-12 h-12 rounded-full shadow-lg border-4 border-primary/20 bg-primary/10">
            {/* Health icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97 0-9-4.03-9-9 0-4.97 4.03-9 9-9s9 4.03 9 9c0 4.97-4.03 9-9 9zm0-4.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0-2.25a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" />
            </svg>
          </span>
          <h1 className="text-3xl font-extrabold text-primary mb-1 tracking-tight drop-shadow">Zappy Health</h1>
          <p className="text-base text-gray-600 font-handwritten">Create your account</p>
        </div>

        {errors.form && (
          <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded flex items-start">
            <X className="h-4 w-4 mr-2 mt-0.5" /> <p>{errors.form}</p>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                className={`block w-full px-3 py-2 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm bg-gray-50`}
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
              />
              {errors.firstName && (
                <p className="mt-0.5 text-xs text-red-600">
                  {errors.firstName}
                </p>
              )}
            </div>
            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                className={`block w-full px-3 py-2 border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm bg-gray-50`}
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
              />
              {errors.lastName && (
                <p className="mt-0.5 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm bg-gray-50`}
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                I am a
              </label>
              <select
                id="role"
                name="role"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-gray-50"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="patient">Patient</option>
                <option value="provider">Provider</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm bg-gray-50`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-0.5 text-xs text-red-600">{errors.password}</p>
              )}
            </div>
            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm bg-gray-50`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-0.5 text-xs text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            
            {/* Password requirements - Moved to right column */}
            <div className="mt-1 space-y-1">
              {passwordRequirements.map((req) => (
                <div key={req.id} className="flex items-center text-xs">
                  {req.test(formData.password) ? (
                    <Check className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <X className="h-3 w-3 text-gray-300 mr-1" />
                  )}
                  <span
                    className={
                      req.test(formData.password)
                        ? 'text-green-700'
                        : 'text-gray-500'
                    }
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Referral Code */}
            <div className="col-span-full md:col-span-1">
              <label
                htmlFor="referralCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Referral Code (Optional)
              </label>
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                autoComplete="off"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm bg-gray-50"
                placeholder="Enter code if you have one"
                value={formData.referralCode}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Terms & Privacy - Now inside the form */}
          <div className="mt-3">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-2 text-xs">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="font-medium text-primary hover:text-primary/80 underline bg-transparent border-none p-0 cursor-pointer"
                    onClick={() => alert('Navigate to Terms of Service (Placeholder)')}
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    className="font-medium text-primary hover:text-primary/80 underline bg-transparent border-none p-0 cursor-pointer"
                    onClick={() => alert('Navigate to Privacy Policy (Placeholder)')}
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
            </div>
          </div>
          
          {/* Submit Button - Inside form */}
          <div className="mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 text-base font-semibold text-white rounded-lg shadow-md transition-all ${isLoading ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
            {/* Sign In Link */}
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
