import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext'; // Keep useAuth
// Removed useMutation and apiService imports

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get login function, loading state, and error from useAuth
  const { login, loading: authLoading, error: authError, isAuthenticated, clearError, userRole, resendVerificationEmail, actionLoading } = useAuth();
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );
  // Use authError directly instead of local apiError state
  // const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues
  } = useForm({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  // Clear auth error on component mount or location change
  useEffect(() => {
    if (authError && clearError) {
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Clear error when navigating to login

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && !authLoading) {
      // Role-based redirect
      if (userRole === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (userRole === 'doctor') {
        navigate('/dashboard', { replace: true });
      } else {
        // Default to patient dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, location.state, authLoading, userRole]); // Added authLoading

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Removed useMutation hook

  // Updated onSubmit to call context login function
  const onSubmit = async (data) => {
    setSuccessMessage('');
    // Clear previous auth error before attempting login
    if (clearError) clearError();

    const { email, password } = data;
    const result = await login(email, password);

    if (result.success) {
      // Navigation is handled by the useEffect watching isAuthenticated
      console.log('Login successful, navigating...');
      reset(); // Reset form on successful login
    } else {
      // Error state is set within the login function in AuthContext
      console.log('Login failed:', result.error);
    }
  };

  useEffect(() => {
    // Show resend button if error is about email not confirmed
    if (authError && typeof authError === 'string' && authError.toLowerCase().includes('email not confirmed')) {
      setShowResend(true);
    } else {
      setShowResend(false);
    }
  }, [authError]);

  // Handler for resend verification email
  const handleResendVerification = async () => {
    setResendStatus('');
    const email = getValues('email');
    if (!email) {
      setResendStatus('Please enter your email above first.');
      return;
    }
    const result = await resendVerificationEmail(email);
    if (result.success) {
      setResendStatus('Verification email sent! Please check your inbox.');
    } else {
      setResendStatus(result.error || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent1/10 via-white to-accent2/10 relative">
      {/* Decorative floating elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent3/20 rounded-full blur-2xl -z-10" />
      <div className="max-w-md w-full bg-white/90 rounded-2xl shadow-2xl overflow-hidden px-8 py-10 border border-gray-100 backdrop-blur-md">
        <div className="text-center mb-8">
          <span className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full shadow-lg border-4 border-primary/20 bg-primary/10">
            {/* Health icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97 0-9-4.03-9-9 0-4.97 4.03-9 9-9s9 4.03 9 9c0 4.97-4.03 9-9 9zm0-4.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0-2.25a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" />
            </svg>
          </span>
          <h1 className="text-4xl font-extrabold text-primary mb-1 tracking-tight drop-shadow">Zappy Health</h1>
          <p className="text-lg text-gray-600 font-handwritten">Log in to your account</p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded flex items-start">
            <CheckCircle className="h-5 w-5 mr-2" /> <p>{successMessage}</p>
          </div>
        )}
        {authError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded flex flex-col items-start">
            <div className="flex items-center"><AlertCircle className="h-5 w-5 mr-2" /> <p>{authError}</p></div>
            {showResend && (
              <>
                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-xs font-medium shadow"
                  onClick={handleResendVerification}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Sending...' : 'Resend verification email'}
                </button>
                {resendStatus && <p className="mt-1 text-xs text-green-700">{resendStatus}</p>}
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              autoComplete="email"
              className={`block w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm bg-gray-50`}
              placeholder="your.email@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email is invalid' },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`block w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm bg-gray-50`}
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 rounded"
                {...register('rememberMe')}
              />
              <span className="ml-2">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className={`w-full py-3 px-4 text-base font-semibold text-white rounded-lg shadow-md transition-all ${authLoading ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
          >
            {authLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-medium"
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
