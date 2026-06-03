import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    const checkSession = async () => {
      try {
        const res = await authService.checkSession();
        if (res.data.success && res.data.data) {
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

  const login = useCallback(async (username, password) => {
    const res = await authService.login({ username, password });
    if (res.data.success) {
      setUser(res.data.data);
    }
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    if (res.data.success) {
      setUser(res.data.data);
    }
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const recover = useCallback(async (data) => {
    const res = await authService.recoverPassword(data);
    return res.data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, recover }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
