// components/common/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * A wrapper component that checks if user is authenticated
 * and redirects to login if not.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set loading to false once auth state is resolved
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#F85C5C]" />
        <p className="ml-4 text-lg">Verifying your session...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the child component
  return children;
};

export default ProtectedRoute;
