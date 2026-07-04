import React from 'react';
import './Sidebar.css';

/**
 * Sidebar Component
 * 
 * Props:
 * - isCollapsed (boolean): Toggles expanded vs compact layout view.
 * - currentRole ('employee' | 'admin' | 'hr'): Filters displayed nav links.
 * - activeRoute (string): Marks active link state for premium HSL coloring.
 * 
 * Responsibilities:
 * - Render main application navigation menu.
 * - Restrict visibility of admin/HR routes using the currentRole prop.
 */
const Sidebar = ({ isCollapsed, currentRole, activeRoute }) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Component Skeleton for Developer A/B */}
      <div className="sidebar-logo">HRMS</div>
      <nav className="sidebar-nav">
        {/* Render links based on role */}
      </nav>
    </aside>
  );
};

export default Sidebar;
