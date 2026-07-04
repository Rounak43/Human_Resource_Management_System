import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

export const AuthContext = createContext(null);

// Helper function to decode JWT payload safely in vanilla JS
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * AuthProvider Component
 * 
 * Responsibilities:
 * - Hold session states (user details, loading status, authentication flags).
 * - Expose functions: login, logout.
 * - Load saved JWT from localStorage on page refresh.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        // Check if token is expired (JWT exp is in seconds, Date.now() is in milliseconds)
        const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
        if (!isExpired) {
          setUser(decoded);
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response.success) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      } else {
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response && response.data && response.data.token) {
      const { token, user: responseUser } = response.data;
      localStorage.setItem('token', token);
      
      // Use decoded user if available, or fall back to responseUser
      const decoded = decodeToken(token);
      const activeUser = decoded || responseUser;
      
      setUser(activeUser);
      setIsAuthenticated(true);
      return activeUser;
    } else {
      throw new Error('Authentication response is missing token details.');
      } catch (error) {
        console.error('Failed to verify token', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfileState = (updatedUser) => {
    setUser(prev => ({
      ...prev,
      name: updatedUser.full_name || prev.name,
      ...updatedUser
    }));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

