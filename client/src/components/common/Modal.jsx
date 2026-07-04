import React from 'react';
import './Modal.css';

/**
 * Modal Overlay Component
 * 
 * Props:
 * - isOpen (boolean): visibility state.
 * - onClose (function): Close trigger.
 * - title (string): Header title.
 * - children (React.ReactNode): Body content.
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
