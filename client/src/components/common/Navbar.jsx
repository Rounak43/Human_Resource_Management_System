import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import './Navbar.css';

/**
 * Navbar Component with top-level navigation links, attendance widget, and avatar dropdown.
 */
const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notify = useContext(NotificationContext);
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyName, setCompanyName] = useState('Odoo India');
  const [attendanceRecord, setAttendanceRecord] = useState(null);

  const profileRef = useRef(null);
  const notifyRef = useRef(null);

  // Fetch notifications and company info
  const loadData = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.data);
      }
      
      // Load company details from profile
      const profRes = await api.get('/employee/profile');
      if (profRes.success && profRes.data) {
        setCompanyName(profRes.data.company_name || 'Odoo India');
        setCompanyLogo(profRes.data.company_logo || '');
      }

      // Load today's attendance status
      if (user?.role === 'employee') {
        const attRes = await api.get('/attendance/today');
        if (attRes.success) {
          setAttendanceRecord(attRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to load notifications or attendance info', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in', {});
      if (res.success) {
        notify?.showNotification('Successfully checked in! Status: Present.', 'success');
        // Reload today's status
        const attRes = await api.get('/attendance/today');
        if (attRes.success) setAttendanceRecord(attRes.data);
      }
    } catch (err) {
      notify?.showNotification(err.message || 'Check-in failed', 'danger');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/attendance/check-out', {});
      if (res.success) {
        notify?.showNotification('Successfully checked out! Shift logged.', 'success');
        // Reload today's status
        const attRes = await api.get('/attendance/today');
        if (attRes.success) setAttendanceRecord(attRes.data);
      }
    } catch (err) {
      notify?.showNotification(err.message || 'Check-out failed', 'danger');
    }
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'HR';

  const isHRAdmin = user?.role === 'admin' || user?.role === 'hr';
  const directoryPath = isHRAdmin ? '/admin/directory' : '/employee/directory';
  const attendancePath = isHRAdmin ? '/admin/attendance' : '/employee/attendance';
  const timeOffPath = isHRAdmin ? '/admin/leaves' : '/employee/leave';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo-area">
          {companyLogo ? (
            <img src={companyLogo} alt="Company Logo" className="navbar-company-logo" />
          ) : (
            <span className="navbar-logo-placeholder">🏢</span>
          )}
          <span className="navbar-company-name">{companyName}</span>
        </div>
      </div>

      {/* Top Level Horizontal Navigation Links */}
      <nav className="navbar-nav-links">
        <Link to={directoryPath} className="nav-link-item">Employees</Link>
        <Link to={attendancePath} className="nav-link-item">Attendance</Link>
        <Link to={timeOffPath} className="nav-link-item">Time Off</Link>
      </nav>

      <div className="navbar-right">
        {/* Floating Attendance Check In/Out Widget */}
        {user && user.role === 'employee' && (
          <div className="navbar-attendance-widget">
            {!attendanceRecord || !attendanceRecord.check_in_time ? (
              <button className="attendance-btn checkin-btn" onClick={handleCheckIn}>
                ⏱️ Check In
              </button>
            ) : !attendanceRecord.check_out_time ? (
              <button className="attendance-btn checkout-btn" onClick={handleCheckOut}>
                <span className="pulse-green-dot"></span> Check Out
              </button>
            ) : (
              <button className="attendance-btn completed-btn" disabled>
                ✅ Checked Out
              </button>
            )}
          </div>
        )}

        {/* Notifications Dropdown */}
        <div className="navbar-notification-container" ref={notifyRef}>
          <button 
            className="navbar-icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="mark-all-read-btn">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notification-body">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.notification_id} 
                      className={`notification-item ${n.is_read ? 'read' : 'unread'}`}
                      onClick={() => !n.is_read && handleMarkAsRead(n.notification_id)}
                    >
                      <div className="notification-item-title">
                        <strong>{n.title}</strong>
                        <span className="notification-time">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="notification-msg">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger & Dropdown */}
        <div className="navbar-profile-container" ref={profileRef}>
          <button 
            className="navbar-profile-trigger" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="user-avatar-circle">
              {userInitials}
            </div>
            <div className="navbar-user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{isHRAdmin ? 'Admin / HR' : 'Employee'}</span>
            </div>
            <span className="dropdown-caret">▼</span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              {isHRAdmin ? (
                <Link 
                  to={`/admin/directory`} 
                  className="dropdown-item" 
                  onClick={() => setShowProfileMenu(false)}
                >
                  👤 My Profile
                </Link>
              ) : (
                <Link 
                  to="/employee/profile" 
                  className="dropdown-item" 
                  onClick={() => setShowProfileMenu(false)}
                >
                  👤 My Profile
                </Link>
              )}
              <hr />
              <button onClick={handleLogout} className="dropdown-item logout-menu-btn">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
