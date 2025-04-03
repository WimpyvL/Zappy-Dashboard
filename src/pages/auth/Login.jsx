import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import apiService from '../../utils/apiService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, error: authError, isAuthenticated, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    if (authError) setApiError(authError);
    clearError && clearError();
  }, [authError, clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || '/', { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const mutation = useMutation({
    mutationFn: ({ email, password }) => apiService.auth.login(email, password),
    onSuccess: (response) => {
      const authHeader =
        response.headers?.authorization || response.headers?.Authorization;
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

      if (token) localStorage.setItem('token', token);

      const userData = {
        email: response.data?.attributes?.email,
        role: response.data?.attributes?.role,
        id: response.data?.id,
      };

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      reset();
    },
    onError: (error) => {
      setApiError(
        error?.response?.data ||
          'An unexpected error occurred. Please try again.'
      );
    },
  });

  const onSubmit = (data) => {
    setSuccessMessage('');
    setApiError('');
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900">MedSub</h1>
          <p className="text-gray-600 mt-1">Log in to your account</p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded flex items-start">
            <CheckCircle className="h-5 w-5 mr-2" /> <p>{successMessage}</p>
          </div>
        )}
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2" /> <p>{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              className={`block w-full px-3 py-2 border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="your.email@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email is invalid' },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                {...register('rememberMe')}
              />
              <span className="ml-2">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={mutation.isLoading}
            className={`w-full py-2 px-4 text-sm font-medium text-white rounded-md shadow-sm ${
              mutation.isLoading
                ? 'bg-indigo-400'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {mutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
