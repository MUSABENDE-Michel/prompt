import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { checkSession, loginUser, logoutUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkedOnce = useRef(false);

  useEffect(() => {
    if (checkedOnce.current) return;
    checkedOnce.current = true;

    const verify = async () => {
      try {
        const res = await checkSession();
        if (res.success) setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await loginUser(username, password);
    if (res.success) setUser(res.data);
    return res;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await registerUser(userData);
    if (res.success) setUser(res.data);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    setUser(null);
  }, []);

  const value = { user, loading, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
