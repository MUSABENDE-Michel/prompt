import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedSession = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;

    const checkSession = async () => {
      try {
        const res = await authService.getSession();
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    if (res.data.success) {
      setUser(res.data.data);
      toast.success('Login successful!');
      navigate('/dashboard');
    }
    return res.data;
  }, [navigate]);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    if (res.data.success) {
      setUser(res.data.data);
      toast.success('Registration successful!');
      navigate('/dashboard');
    }
    return res.data;
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      //
    } finally {
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    }
  }, [navigate]);

  const recover = useCallback(async (data) => {
    const res = await authService.recoverPassword(data);
    return res.data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, recover }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
