import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../../context/ThemeContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './Settings.css';

const Settings = () => {
  const { user, updateProfileState } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const notify = useContext(NotificationContext);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Password updates
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const res = await api.get('/employee/profile');
        if (res.success) {
          setFullName(res.data.full_name || '');
          setPhone(res.data.phone || '');
          setAddress(res.data.address || '');
        }
      } catch (err) {
        console.error('Failed to load profile details in settings', err);
      }
    };
    fetchCurrentProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        full_name: fullName,
        phone,
        address
      };

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          notify?.showNotification('Passwords do not match', 'warning');
          setIsSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          notify?.showNotification('Password must be at least 6 characters', 'warning');
          setIsSaving(false);
          return;
        }
        payload.newPassword = newPassword;
      }

      const res = await api.patch('/employee/profile', payload);
      if (res.success) {
        notify?.showNotification('Profile updated successfully!', 'success');
        
        // Update user state in auth context
        if (updateProfileState) {
          updateProfileState(res.data);
        }
        
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification(err.message || 'Failed to save changes', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-page-container">
      <div className="settings-header">
        <h2>Account Settings</h2>
        <p>Manage your login credentials, contact info, and theme display choices.</p>
      </div>

      <div className="settings-content-grid">
        {/* Profile Card */}
        <div className="settings-card">
          <h3>Personal Details</h3>
          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input 
                type="text" 
                className="form-input" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 555-0150"
                disabled={isSaving}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <textarea 
                className="form-input text-area" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address details..."
                rows="3"
                disabled={isSaving}
              />
            </div>

            <hr className="settings-divider" />
            
            <h3>Update Password</h3>
            <div className="form-group">
              <label className="form-label">New Password (leave empty to keep current)</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <button type="submit" className="save-settings-btn" disabled={isSaving}>
              {isSaving ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Preferences Card */}
        <div className="settings-card preferences-card">
          <h3>Display Preferences</h3>
          
          <div className="preference-item">
            <div className="preference-info">
              <strong>Theme Mode</strong>
              <p>Switch between dark and light colors matching your environment.</p>
            </div>
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
            </button>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <strong>System Notifications</strong>
              <p>Email status reports on leave approvals, monthly payroll generation, and check-in schedules.</p>
            </div>
            <span className="pref-tag-active">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
