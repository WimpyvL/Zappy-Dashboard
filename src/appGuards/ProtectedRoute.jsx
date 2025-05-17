// components/common/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Shield, ShieldAlert } from 'lucide-react';

/**
 * A wrapper component that checks if user is authenticated
 * and redirects to login if not.
 * Now includes super user mode that bypasses authentication checks.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading, isSuperUser, toggleSuperUser } =
    useAuth();
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

  // If authenticated, render the child component with super user indicator if applicable
  return (
    <>
      {isSuperUser && (
        <div
          className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-md flex items-center cursor-pointer shadow-md"
          onClick={toggleSuperUser}
          title="Click to toggle super user mode"
        >
          {isSuperUser ? (
            <>
              <ShieldAlert className="h-5 w-5 mr-2" />
              <span>Super User Mode Active</span>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5 mr-2" />
              <span>Normal Mode</span>
            </>
          )}
        </div>
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
