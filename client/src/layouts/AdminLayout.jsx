import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import './AdminLayout.css';

/**
 * AdminLayout Component
 * 
 * Responsibilities:
 * - Wrap admin features.
 * - Manage sidebar toggle collapse state.
 */
const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="admin-layout-grid">
      <Sidebar isCollapsed={isCollapsed} currentRole="admin" />
      <div className="admin-main-content">
        <Navbar 
          title="Admin Control Center" 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
        />
        <main className="admin-viewport">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
