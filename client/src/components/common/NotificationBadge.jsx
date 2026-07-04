import React from 'react';
import './NotificationBadge.css';

/**
 * NotificationBadge Component
 * 
 * Props:
 * - count (number): Alert count.
 * - max (number): Max count to display (e.g. 99+).
 */
const NotificationBadge = ({ count = 0, max = 99 }) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span className="notification-badge">
      {displayCount}
    </span>
  );
};

export default NotificationBadge;
