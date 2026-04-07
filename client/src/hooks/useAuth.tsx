import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import apiClient, { setSessionExpiredHandler } from '../api/client';

interface User {
  id: string;
  email: string;
  nickname: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSessionMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  // Restore user from stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Register session expiry handler
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      localStorage.removeItem('user');
      setSessionMessage('세션이 만료되었습니다. 다시 로그인해주세요');
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setSessionMessage(null);
  }, []);

  const register = useCallback(async (email: string, password: string, nickname: string) => {
    await apiClient.post('/auth/register', { email, password, nickname });
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const clearSessionMessage = useCallback(() => {
    setSessionMessage(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sessionMessage,
        login,
        register,
        logout,
        clearSessionMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
