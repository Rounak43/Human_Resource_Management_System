import React from 'react';
import './Card.css';

/**
 * Card Component
 * 
 * Props:
 * - title (string): Header title string of the card.
 * - children (React.ReactNode): Body content.
 * - actions (React.ReactNode): Optional header right-side custom actions (like buttons).
 * - className (string): Extra visual classes.
 */
const Card = ({ title, children, actions, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
