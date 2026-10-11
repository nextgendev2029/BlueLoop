/**
 * BlueLoop Authentication Service
 * Endpoints for signup, login, session inspection, and user status management.
 */

import { apiClient, setStoredAuthToken, clearStoredAuthToken } from '../lib/api';
import {
  AuthSession,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from '../types/auth';

export async function signup(payload: SignupPayload): Promise<AuthSession> {
  const session = await apiClient<AuthSession>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (session?.token) {
    setStoredAuthToken(session.token);
  }
  return session;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const session = await apiClient<AuthSession>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (session?.token) {
    setStoredAuthToken(session.token);
  }
  return session;
}

export async function logout(): Promise<{ message: string }> {
  try {
    const result = await apiClient<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
    });
    return result;
  } finally {
    clearStoredAuthToken();
  }
}

export async function getMe(): Promise<AuthUser> {
  return apiClient<AuthUser>('/api/v1/auth/me', {
    method: 'GET',
  });
}

export async function listUsers(): Promise<AuthUser[]> {
  return apiClient<AuthUser[]>('/api/v1/auth/users', {
    method: 'GET',
  });
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<AuthUser> {
  return apiClient<AuthUser>(`/api/v1/auth/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}
