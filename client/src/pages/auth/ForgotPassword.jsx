import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { NotificationContext } from '../../context/NotificationContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showNotification('Please enter your email address', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      showNotification('Password reset link sent to your email!', 'success');
      setEmail('');
      // Redirect back to login after short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Forgot password error:', error);
      const errorMsg = error.message || 'Failed to request password reset. Please try again.';
      showNotification(errorMsg, 'error');
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
      <p>Enter your registered email address to receive reset instructions</p>
      
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <label>
          <span>Email Address</span>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={isSubmitting}
            placeholder="name@company.com"
          />
        </label>
        
        <button type="submit" className="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
        </button>
      </form>

      <Link to="/login" className="back-to-login">
        ← Back to Sign In
      </Link>
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
