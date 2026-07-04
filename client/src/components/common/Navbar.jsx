import React from 'react';
import './Navbar.css';

/**
 * Navbar Component
 * 
 * Props:
 * - title (string): Displayed section heading.
 * - user (object): Profile details of current authenticated session.
 * - onToggleSidebar (function): callback to collapse/expand navigation panel.
 */
const Navbar = ({ title, user, onToggleSidebar }) => {
  return (
    <header className="navbar">
      <button className="sidebar-toggle" onClick={onToggleSidebar}>
        {/* Toggle icon */}
        &#9776;
      </button>
      <h2 className="navbar-title">{title || 'HRMS'}</h2>
      <div className="navbar-actions">
        {/* Render notification badge and user profile icon */}
      </div>
    </header>
  );
};

export default Navbar;
