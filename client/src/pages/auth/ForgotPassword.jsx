import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { NotificationContext } from '../../context/NotificationContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useContext(NotificationContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      notify?.showNotification('Reset link sent to your email!', 'success');
    } catch (err) {
      notify?.showNotification(err.message || 'Error occurred', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <h2>Reset Password</h2>
      <p>Enter your email to receive a recovery link</p>
      
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="name@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" className="forgot-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="forgot-footer">
        <Link to="/login" className="back-login-link">← Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
