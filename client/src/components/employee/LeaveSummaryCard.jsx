import React from 'react';
import './LeaveSummaryCard.css';

/**
 * LeaveSummaryCard Component
 * 
 * Props:
 * - allowed (number): Total yearly leaves allocated.
 * - taken (number): Count of leaves taken.
 * - pending (number): Leaves awaiting approval.
 */
const LeaveSummaryCard = ({ allowed = 20, taken = 0, pending = 0 }) => {
  return (
    <div className="leave-summary-card">
      {/* Component layout representing annual leaf allocations */}
      <div className="leave-stat">
        <span className="leave-stat-label">Remaining Leaves</span>
        <span className="leave-stat-value">{allowed - taken}</span>
      </div>
    </div>
  );
};

export default LeaveSummaryCard;
