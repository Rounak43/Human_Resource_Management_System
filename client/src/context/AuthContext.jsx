import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
