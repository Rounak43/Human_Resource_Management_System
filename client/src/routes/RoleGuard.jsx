import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * RoleGuard Component
 * 
 * Props:
 * - allowedRoles (string[]): Set of permitted roles (e.g. ['admin', 'hr']).
 * 
 * Responsibilities:
 * - Validate user session role claims.
 * - Redirect unauthorized employees to their respective home dashboard.
 */
const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  const hasAccess = user && allowedRoles.includes(user.role);

  return hasAccess ? children : <Navigate to="/employee/dashboard" replace />;
};

export default RoleGuard;
