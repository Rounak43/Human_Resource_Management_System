import React from 'react';
import './Button.css';

/**
 * Reusable Button Component
 * 
 * Props:
 * - children (React.ReactNode): Label/icons inside the button.
 * - onClick (function): Click trigger handler.
 * - type (string): Form submit, reset, or standard button type.
 * - variant (string): 'primary' | 'secondary' | 'danger' | 'outline' | 'text'.
 * - size (string): 'sm' | 'md' | 'lg'.
 * - disabled (boolean): Click block flag.
 * - isLoading (boolean): Toggles loading state spinner.
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="btn-spinner"></span> : children}
    </button>
  );
};

export default Button;
