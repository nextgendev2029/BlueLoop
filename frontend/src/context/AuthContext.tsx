/**
 * BlueLoop Authentication Context & Hook
 * Manages user authentication state, session restoration, and role permissions.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, LoginPayload, SignupPayload } from '../types/auth';
import { getMe, login as apiLogin, logout as apiLogout, signup as apiSignup } from '../services/auth';
import { BlueLoopApiError, clearStoredAuthToken, getStoredAuthToken } from '../lib/api';

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (role: 'buyer' | 'supplier' | 'admin') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'blueloop_auth_user';

function getStoredUser(): AuthUser | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(USER_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // Ignore storage or parse errors
  }
  return null;
}

function setStoredUser(user: AuthUser | null): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  } catch {
    // Ignore storage errors
  }
}

export const DEMO_CREDENTIALS = {
  buyer: {
    email: 'buyer@blueloop.io',
    password: 'Password123!',
    label: 'Demo Industrial Buyer',
    orgName: 'Apex Data Centers',
  },
  supplier: {
    email: 'supplier@blueloop.io',
    password: 'Password123!',
    label: 'Demo Effluent Supplier',
    orgName: 'Maraimalai Clean Tech',
  },
  admin: {
    email: 'admin@blueloop.io',
    password: 'AdminPassword123!',
    label: 'Platform Administrator',
    orgName: 'BlueLoop Platform Operations',
  },
} as const;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = getStoredAuthToken();
    if (!token) return null;
    return getStoredUser();
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const token = getStoredAuthToken();
    return !!token;
  });

  const refreshUser = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setUser(null);
      setStoredUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await getMe();
      setUser(me);
      setStoredUser(me);
    } catch (err: any) {
      // Only true 401 or 403 HTTP errors invalidate the session
      if (err instanceof BlueLoopApiError && (err.status === 401 || err.status === 403)) {
        setUser(null);
        setStoredUser(null);
        clearStoredAuthToken();
      } else {
        // Transient network failure or Lambda warm-up: do not purge session
        console.warn('Session check encountered transient error, preserving cached credentials:', err?.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const session = await apiLogin(payload);
      setUser(session.user);
      setStoredUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: SignupPayload) => {
    setIsLoading(true);
    try {
      const session = await apiSignup(payload);
      setUser(session.user);
      setStoredUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setStoredUser(null);
      clearStoredAuthToken();
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: 'buyer' | 'supplier' | 'admin') => {
    const creds = DEMO_CREDENTIALS[role];
    await login({ email: creds.email, password: creds.password });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        quickLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
