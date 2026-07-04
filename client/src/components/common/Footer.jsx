import React from 'react';
import './Footer.css';

/**
 * Footer Component
 * 
 * Responsibilities:
 * - Render static copyright and support links.
 */
const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Enterprise HRMS. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
