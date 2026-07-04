import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute Guard Wrapper
 * 
 * Responsibilities:
 * - Read user authentication status from useAuth hook context.
 * - Redirect unauthenticated requests back to the '/login' path.
 * - Restrict access and redirect to '/change-password' if must_change_password is true.
 */
const ProtectedRoute = ({ children, allowPasswordChangePending = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading authentication session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Force redirection to change-password if required and not already on the change-password route
  if (user?.must_change_password && !allowPasswordChangePending) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

export default ProtectedRoute;
