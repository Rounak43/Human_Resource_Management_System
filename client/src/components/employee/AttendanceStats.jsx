import React from 'react';
import './AttendanceStats.css';

/**
 * AttendanceStats Component
 * 
 * Props:
 * - stats (object): Hours worked, present days, absent days, late days.
 * 
 * Target:
 * - Developer B (Employee Modules)
 */
const AttendanceStats = ({ stats }) => {
  return (
    <div className="attendance-stats-grid">
      {/* Display numeric card elements for worked hours, present count, absent count */}
      <div className="stats-card">
        <h4>Weekly Present Days</h4>
        <p className="stats-value">0/5</p>
      </div>
    </div>
  );
};

export default AttendanceStats;
