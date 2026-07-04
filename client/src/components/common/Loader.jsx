import React from 'react';
import './Loader.css';

/**
 * Loader Component
 * 
 * Props:
 * - fullScreen (boolean): Covers the entire viewport with an overlay backdrop.
 */
const Loader = ({ fullScreen = false }) => {
  return (
    <div className={`loader-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="loader-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default Loader;
