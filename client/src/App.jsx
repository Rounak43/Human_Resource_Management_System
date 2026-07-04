import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

/**
 * App Root Component
 * 
 * Responsibilities:
 * - Wrap application inside BrowserRouter router engine.
 * - Mount Providers (Auth, Theme, Notification Alert contexts).
 * - Render main AppRoutes handler.
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
