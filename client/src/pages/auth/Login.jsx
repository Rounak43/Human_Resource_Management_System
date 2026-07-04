import React from 'react';
import './Login.css';

/**
 * Login Page
 * 
 * Responsibilities:
 * - Render credentials form (Email, Password).
 * - Perform front-end validation (email pattern, password minimum length).
 * - Invoke authService.login() on submission.
 * - Save JWT inside AuthContext and redirect to appropriate dashboard.
 * 
 * Target: Developer A
 */
const Login = () => {
  return (
    <div className="login-page">
      <h2>Welcome Back</h2>
      <p>Sign in to your HRMS account</p>
      {/* Scaffold form wrapper for Developer A */}
      <form className="login-form">
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" placeholder="name@company.com" required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" placeholder="••••••••" required />
        </div>
        <button type="submit" className="login-submit-btn">Login</button>
      </form>
    </div>
  );
};

export default Login;
