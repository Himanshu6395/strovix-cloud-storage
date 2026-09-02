import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/auth.api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const clearSession = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    persistTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    persistTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearSession();
  };

  const setSessionFromOAuth = (accessToken, refreshToken) => {
    persistTokens(accessToken, refreshToken);
    return bootstrap();
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      setUser,
      setSessionFromOAuth,
      refreshUser: bootstrap,
    }),
    [user, loading, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
