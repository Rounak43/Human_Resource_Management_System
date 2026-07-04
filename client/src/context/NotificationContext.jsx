import React, { createContext, useState, useEffect } from 'react';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type, duration });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, notification.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Color mapping based on notification type
  const getColors = (type) => {
    switch (type) {
      case 'error':
        return {
          bg: 'rgba(254, 242, 242, 0.9)',
          border: '#ef4444',
          text: '#991b1b',
          icon: '❌'
        };
      case 'warning':
        return {
          bg: 'rgba(255, 251, 235, 0.9)',
          border: '#f59e0b',
          text: '#92400e',
          icon: '⚠️'
        };
      case 'info':
        return {
          bg: 'rgba(240, 249, 255, 0.9)',
          border: '#3b82f6',
          text: '#075985',
          icon: 'ℹ️'
        };
      case 'success':
      default:
        return {
          bg: 'rgba(240, 253, 244, 0.9)',
          border: '#22c55e',
          text: '#166534',
          icon: '✅'
        };
    }
  };

  const toastStyle = notification ? {
    position: 'fixed',
    top: '24px',
    right: '24px',
    zIndex: 9999,
    padding: '16px 20px',
    borderRadius: '12px',
    backgroundColor: getColors(notification.type).bg,
    borderLeft: `5px solid ${getColors(notification.type).border}`,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    color: getColors(notification.type).text,
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backdropFilter: 'blur(8px)',
    animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    maxWidth: '380px',
  } : {};

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
      {notification && (
        <>
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(120%) scale(0.9);
                opacity: 0;
              }
              to {
                transform: translateX(0) scale(1);
                opacity: 1;
              }
            }
          `}</style>
          <div style={toastStyle}>
            <span style={{ fontSize: '18px' }}>{getColors(notification.type).icon}</span>
            <div>{notification.message}</div>
          </div>
        </>
      )}
    </NotificationContext.Provider>
  );
};

