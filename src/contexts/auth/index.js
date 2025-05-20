/**
 * @fileoverview Authentication context exports
 * This file exports all authentication-related context providers and hooks
 */

import React from 'react';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { SessionProvider, useSession } from './SessionContext.jsx';
import { UserProfileProvider, useUserProfile } from './UserProfileContext.jsx';

/**
 * Combined authentication provider that wraps all auth-related providers
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Combined auth providers
 */
export const AuthProviders = ({ children }) => (
  <AuthProvider>
    <SessionProvider>
      <UserProfileProvider>
        {children}
      </UserProfileProvider>
    </SessionProvider>
  </AuthProvider>
);

// Export individual providers for cases where only one is needed
export { AuthProvider, SessionProvider, UserProfileProvider };

// Export hooks for consuming the contexts
export { useAuth, useSession, useUserProfile };