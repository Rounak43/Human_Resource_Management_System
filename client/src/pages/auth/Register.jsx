import React from 'react';
import './Register.css';

/**
 * Register Page
 * 
 * Responsibilities:
 * - Render sign-up form elements (Name, Email, Password, Department, Designation, Phone).
 * - Target: Developer A
 */
const Register = () => {
  return (
    <div className="register-page">
      <h2>Create an Account</h2>
      <p>Register a new employee profile</p>
      <form className="register-form">
        {/* Render register form input fields */}
      </form>
    </div>
  );
};

export default Register;
