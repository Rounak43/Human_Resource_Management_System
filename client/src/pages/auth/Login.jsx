import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContext } from '../../context/NotificationContext';
import './Login.css';

/**
 * Login Page
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const notifyContext = useContext(NotificationContext);
  const showNotification = notifyContext?.showNotification;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      if (showNotification) {
        showNotification('Successfully logged in!', 'success');
      }
      
      if (loggedUser.must_change_password) {
        navigate('/change-password');
      } else if (loggedUser.role === 'admin' || loggedUser.role === 'hr') {
        navigate('/admin/directory');
      } else {
        navigate('/employee/directory');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || 'Invalid email or password. Please try again.';
      setErrorMessage(errMsg);
      if (showNotification) {
        showNotification(errMsg, 'danger');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <h2>Welcome Back</h2>
        <p>Sign in to your HRMS account</p>
      </div>

      {errorMessage && (
        <div className="login-error-alert">
          ⚠️ {errorMessage}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Login ID (Employee or Admin ID)</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. OIROSH20260001" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-input" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>
        
        <div className="login-actions">
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>
        </div>

        <button 
          type="submit" 
          className="login-submit-btn" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="login-footer">
        <span>Need an account? Contact your HR Manager.</span>
      </div>
    </div>
  );
};

export default Login;
