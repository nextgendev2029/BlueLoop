/**
 * BlueLoop Authentication & Multi-Tenant Types
 */

export type UserRole = 'supplier' | 'buyer' | 'admin';

export interface AuthOrganisation {
  id: string;
  name: string;
  org_type: string;
  verification_status: string;
  contact_email: string;
  is_synthetic: boolean;
}

export interface AuthUser {
  id: string;
  org_id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  organisation?: AuthOrganisation | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface AuthSession {
  token: string;
  token_type: string;
  user: AuthUser;
  message: string;
}

export interface SignupPayload {
  name: string;
  company_name: string;
  email: string;
  password: string;
  role: 'buyer' | 'supplier';
}

export interface LoginPayload {
  email: string;
  password: string;
}
