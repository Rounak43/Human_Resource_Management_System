import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

/**
 * AuthLayout Component
 * 
 * Responsibilities:
 * - Render authentication screens centered vertically and horizontally.
 * - Serve as visual container for Login, Register, ForgotPassword.
 */
const AuthLayout = () => {
  return (
    <div className="auth-layout-container">
      <main className="auth-card-wrapper">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
