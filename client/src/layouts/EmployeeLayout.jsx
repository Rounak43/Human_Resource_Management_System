import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import './EmployeeLayout.css';

/**
 * EmployeeLayout Component
 * 
 * Responsibilities:
 * - Wrap employee dashboards.
 * - Manage sidebar toggle collapse state.
 * - Provide context wrapper for layout structures.
 */
const EmployeeLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="employee-layout-grid">
      <Sidebar isCollapsed={isCollapsed} currentRole="employee" />
      <div className="employee-main-content">
        <Navbar 
          title="Employee Portal" 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
        />
        <main className="employee-viewport">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default EmployeeLayout;
