import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './ChangePassword.css';

const ChangePassword = () => {
  const { user, updateProfileState } = useContext(AuthContext);
  const notify = useContext(NotificationContext);
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form Validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      notify?.showNotification('Password is too short.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      notify?.showNotification('Passwords do not match.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Calls patch endpoint which triggers password hash update and flips must_change_password to FALSE
      const response = await api.patch('/employee/profile', { newPassword });
      if (response.success) {
        notify?.showNotification('Password updated successfully. Access granted.', 'success');
        
        // Update local session state
        updateProfileState({ must_change_password: false });

        // Navigate based on user role
        if (user?.role === 'admin' || user?.role === 'hr') {
          navigate('/admin/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        setError(response.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
      notify?.showNotification('Failed to update password.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <div className="card-header">
          <h2>Change Temporary Password</h2>
          <p>You must change your secure temporary password before accessing the enterprise workspace.</p>
        </div>

        {error && (
          <div className="error-alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password"
              className="form-input"
              placeholder="Min 8 characters, uppercase, numbers"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input 
              type="password"
              className="form-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Updating Password...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
