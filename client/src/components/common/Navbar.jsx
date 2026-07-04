import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import './Navbar.css';

/**
 * Navbar Component
 */
const Navbar = ({ title, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notifyRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds for dynamics
      const interval = setInterval(fetchNotifications, 30000);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (user?.role === 'admin') {
        navigate(`/admin/employees?search=${searchQuery}`);
      } else {
        navigate(`/employee/attendance?search=${searchQuery}`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'HR';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>
          ☰
        </button>
        <span className="navbar-section-title">{title}</span>
      </div>

      <form className="navbar-search" onSubmit={handleSearchSubmit}>
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search employees, logs, payroll..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="navbar-right">
        {/* Notifications */}
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

        {/* User Profile */}
        <div className="navbar-profile-container" ref={profileRef}>
          <button 
            className="navbar-profile-trigger" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="user-avatar-circle">
              {userInitials}
            </div>
            <div className="navbar-user-info">
              <span className="user-name">{user?.name || 'HR User'}</span>
              <span className="user-role">{user?.role === 'admin' ? 'Admin / HR' : 'Employee'}</span>
            </div>
            <span className="dropdown-caret">▼</span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              {user?.role === 'employee' && (
                <Link to="/employee/profile" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                  👤 My Profile
                </Link>
              )}
              <Link to="/employee/settings" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                ⚙️ Settings
              </Link>
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
