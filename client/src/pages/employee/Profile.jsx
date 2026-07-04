import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/employee/profile');
        if (res.success) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error(err);
        notify?.showNotification('Failed to fetch profile details', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-loading">Loading employee profile...</div>;
  }

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'EM';

  return (
    <div className="profile-page-container">
      <div className="profile-header-section">
        <h2>My Corporate Profile</h2>
        <p>View your employment directory registration and contract details.</p>
      </div>

      {profile && (
        <div className="profile-card-layout">
          {/* Main Card */}
          <div className="profile-overview-card">
            <div className="profile-avatar-circle">
              {userInitials}
            </div>
            <h3 className="profile-name">{profile.full_name}</h3>
            <span className="profile-designation">{profile.designation}</span>
            <span className="profile-dept-badge">{profile.department_name} Department</span>
            
            <hr className="profile-card-divider" />
            
            <div className="profile-quick-meta">
              <div>
                <span>Date Joined:</span>
                <strong>{new Date(profile.joining_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
              <div>
                <span>Employment Status:</span>
                <strong className="status-active">Active Full-Time</strong>
              </div>
            </div>
            
            <button onClick={() => navigate('/employee/settings')} className="edit-profile-trigger-btn">
              ⚙️ Manage Settings
            </button>
          </div>

          {/* Details Card */}
          <div className="profile-details-card">
            <h3>Employee Details</h3>
            <div className="details-form-display">
              <div className="detail-item">
                <label>Email Address</label>
                <span>{profile.email}</span>
              </div>
              <div className="detail-item">
                <label>Contact Phone</label>
                <span>{profile.phone || 'Not Specified'}</span>
              </div>
              <div className="detail-item">
                <label>Residential Address</label>
                <span>{profile.address || 'Not Specified'}</span>
              </div>
              <div className="detail-item">
                <label>Current Monthly Basic Salary</label>
                <span className="salary-text">₹{parseFloat(profile.salary || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="profile-disclaimer-info">
              💡 <span>For changes to designation, salary scaling, or department assignments, please contact the HR Administrator directly.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
