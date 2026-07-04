import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

/**
 * Sidebar Component
 */
const Sidebar = ({ isCollapsed, currentRole }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeLinks = [
    { path: '/employee/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/employee/profile', label: 'My Profile', icon: '👤' },
    { path: '/employee/attendance', label: 'Attendance', icon: '📅' },
    { path: '/employee/leave', label: 'Leave Management', icon: '✉️' },
    { path: '/employee/payroll', label: 'Payroll', icon: '💵' },
    { path: '/employee/settings', label: 'Settings', icon: '⚙️' }
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/employees', label: 'Employees', icon: '👥' },
    { path: '/admin/attendance', label: 'Attendance', icon: '📅' },
    { path: '/admin/leaves', label: 'Leave Requests', icon: '✉️' },
    { path: '/admin/payroll', label: 'Payroll', icon: '💵' },
    { path: '/admin/departments', label: 'Departments', icon: '🏢' },
    { path: '/admin/reports', label: 'Reports', icon: '📈' },
    { path: '/employee/settings', label: 'Settings', icon: '⚙️' }
  ];

  const links = currentRole === 'admin' ? adminLinks : employeeLinks;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">💼</div>
        {!isCollapsed && <span className="sidebar-logo-text">HRMS Pro</span>}
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={link.label}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {!isCollapsed && <span className="sidebar-link-label">{link.label}</span>}
          </NavLink>
        ))}

        <button onClick={handleLogout} className="sidebar-link logout-btn" title="Logout">
          <span className="sidebar-link-icon">🚪</span>
          {!isCollapsed && <span className="sidebar-link-label">Logout</span>}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
