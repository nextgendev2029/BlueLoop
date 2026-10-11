import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute } from '../src/components/PublicRoute';
import { ProtectedRoute } from '../src/components/ProtectedRoute';
import { DEMO_CREDENTIALS } from '../src/context/AuthContext';
import * as AuthContextModule from '../src/context/AuthContext';
import { AppLayout } from '../src/layouts/AppLayout';
import * as HealthService from '../src/services/health';

describe('BlueLoop Route Protection & Sidebar Regression Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(HealthService, 'fetchHealth').mockResolvedValue({
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      synthetic_data_mode: true,
    });
  });

  describe('1 & 2. PublicRoute Unauthenticated Visitor Access', () => {
    it('renders public child component when visitor is unauthenticated and not loading', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        quickLogin: vi.fn(),
        refreshUser: vi.fn(),
      });

      const html = renderToStaticMarkup(
        <PublicRoute>
          <div data-testid="landing-content">Public Landing Page</div>
        </PublicRoute>
      );

      expect(html).toContain('Public Landing Page');
      expect(html).not.toContain('Authenticating Session');
    });

    it('permits unauthenticated access to login and signup pages', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        quickLogin: vi.fn(),
        refreshUser: vi.fn(),
      });

      const loginHtml = renderToStaticMarkup(
        <PublicRoute>
          <div data-testid="login-content">Login Form</div>
        </PublicRoute>
      );

      const signupHtml = renderToStaticMarkup(
        <PublicRoute>
          <div data-testid="signup-content">Signup Form</div>
        </PublicRoute>
      );

      expect(loginHtml).toContain('Login Form');
      expect(signupHtml).toContain('Signup Form');
    });
  });

  describe('3, 4, 5. Demo Profile Credentials', () => {
    it('defines valid demo accounts for Buyer, Supplier, and Admin', () => {
      expect(DEMO_CREDENTIALS.buyer.email).toBe('buyer@blueloop.io');
      expect(DEMO_CREDENTIALS.buyer.orgName).toBe('Apex Data Centers');

      expect(DEMO_CREDENTIALS.supplier.email).toBe('supplier@blueloop.io');
      expect(DEMO_CREDENTIALS.supplier.orgName).toBe('Maraimalai Clean Tech');

      expect(DEMO_CREDENTIALS.admin.email).toBe('admin@blueloop.io');
      expect(DEMO_CREDENTIALS.admin.orgName).toBe('BlueLoop Platform Operations');
    });
  });

  describe('6, 7, 8. Authenticated User Redirect from /', () => {
    const roles: Array<'buyer' | 'supplier' | 'admin'> = ['buyer', 'supplier', 'admin'];

    roles.forEach((role) => {
      it(`redirects authenticated ${role} to /app/dashboard and refuses to render public content`, () => {
        vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
          user: {
            id: `USR-${role.toUpperCase()}-01`,
            email: DEMO_CREDENTIALS[role].email,
            name: DEMO_CREDENTIALS[role].label,
            role,
            is_active: true,
            org_id: 'ORG-01',
            organisation: {
              id: 'ORG-01',
              name: DEMO_CREDENTIALS[role].orgName,
              org_type: role === 'admin' ? 'regulator' : role,
              created_at: '2026-01-01',
            },
          },
          isAuthenticated: true,
          isLoading: false,
          login: vi.fn(),
          signup: vi.fn(),
          logout: vi.fn(),
          quickLogin: vi.fn(),
          refreshUser: vi.fn(),
        });

        // Test component output directly
        const result = PublicRoute({
          children: <div data-testid="landing-content">Public Landing Page</div>,
        }) as React.ReactElement;

        // Must return Navigate to /app/dashboard with replace
        expect(result.type).toBe(Navigate);
        expect(result.props.to).toBe('/app/dashboard');
        expect(result.props.replace).toBe(true);

        // Render to static markup inside MemoryRouter must never contain public content
        const html = renderToStaticMarkup(<MemoryRouter>{result}</MemoryRouter>);
        expect(html).not.toContain('Public Landing Page');
      });
    });
  });

  describe('9. Authenticated User Redirect from /login and /signup', () => {
    it('redirects authenticated user accessing /login or /signup to /app/dashboard', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: {
          id: 'USR-BUYER-01',
          email: 'buyer@blueloop.io',
          name: 'Demo Industrial Buyer',
          role: 'buyer',
          is_active: true,
          org_id: 'ORG-01',
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        quickLogin: vi.fn(),
        refreshUser: vi.fn(),
      });

      const loginResult = PublicRoute({
        children: <div>Login Form</div>,
      }) as React.ReactElement;

      expect(loginResult.type).toBe(Navigate);
      expect(loginResult.props.to).toBe('/app/dashboard');
      expect(loginResult.props.replace).toBe(true);

      const signupResult = PublicRoute({
        children: <div>Signup Form</div>,
      }) as React.ReactElement;

      expect(signupResult.type).toBe(Navigate);
      expect(signupResult.props.to).toBe('/app/dashboard');
      expect(signupResult.props.replace).toBe(true);
    });
  });

  describe('10 & 15. Authenticated Sidebar Cleanup & Logo Navigation', () => {
    it('sidebar logo links strictly to /app/dashboard, not /', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: {
          id: 'USR-BUYER-01',
          email: 'buyer@blueloop.io',
          name: 'Demo Industrial Buyer',
          role: 'buyer',
          is_active: true,
          org_id: 'ORG-01',
          organisation: {
            id: 'ORG-01',
            name: 'Apex Data Centers',
            org_type: 'buyer',
            created_at: '2026-01-01',
          },
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        quickLogin: vi.fn(),
        refreshUser: vi.fn(),
      });

      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <Routes>
            <Route path="/app/*" element={<AppLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // Logo must link to /app/dashboard
      expect(html).toContain('href="/app/dashboard"');
      // Logo link to public root must not exist in the sidebar
      expect(html).not.toMatch(/<aside[\s\S]*?href="\/"/);
    });

    it('sidebar contains NO "Public Overview" section or "View Site" link', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: {
          id: 'USR-SUPPLIER-01',
          email: 'supplier@blueloop.io',
          name: 'Demo Effluent Supplier',
          role: 'supplier',
          is_active: true,
          org_id: 'ORG-02',
          organisation: {
            id: 'ORG-02',
            name: 'Maraimalai Clean Tech',
            org_type: 'supplier',
            created_at: '2026-01-01',
          },
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        quickLogin: vi.fn(),
        refreshUser: vi.fn(),
      });

      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <Routes>
            <Route path="/app/*" element={<AppLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify complete removal of Public Overview and View Site
      expect(html).not.toContain('Public Overview');
      expect(html).not.toContain('View Site');
      // Verify main navigation items remain intact
      expect(html).toContain('Dashboard');
      expect(html).toContain('Suppliers');
      expect(html).toContain('Demand Requests');
      expect(html).toContain('Allocations');
      expect(html).toContain('Deliveries');
      expect(html).toContain('Impact Reports');
      expect(html).toContain('Settings');
      // Verify user info and sign out button are present
      expect(html).toContain('Maraimalai Clean Tech');
      expect(html).toContain('Sign Out');
    });
  });

  describe('11. Refresh Preservation & Async Auth Loading State', () => {
    it('shows authenticating loader and does not redirect while isLoading is true', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true, // Simulation: session restore in progress
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        quickLogin: vi.fn(),
        refreshUser: vi.fn(),
      });

      const publicHtml = renderToStaticMarkup(
        <PublicRoute>
          <div>Public Landing</div>
        </PublicRoute>
      );

      const protectedResult = (
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <ProtectedRoute />
        </MemoryRouter>
      );
      const protectedHtml = renderToStaticMarkup(protectedResult);

      // Neither should flash destination or wrong routes during loading
      expect(publicHtml).toContain('Authenticating Session');
      expect(publicHtml).not.toContain('Public Landing');

      expect(protectedHtml).toContain('Authenticating Session');
      expect(protectedHtml).not.toContain('Sign In');
    });
  });

  describe('12 & 13. ProtectedRoute Unauthenticated Access Rejection', () => {
    it('unauthenticated user accessing protected route is redirected to /login', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        quickLogin: vi.fn(),
        refreshUser: vi.fn(),
      });

      const result = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <ProtectedRoute />
        </MemoryRouter>
      );

      // In static markup, Navigate renders empty string, and Outlet is not rendered
      expect(result).toBe('');
    });

    it('authenticated user accessing protected route renders outlet content successfully', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: {
          id: 'USR-ADMIN-01',
          email: 'admin@blueloop.io',
          name: 'Platform Administrator',
          role: 'admin',
          is_active: true,
          org_id: 'ORG-ADMIN',
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        quickLogin: vi.fn(),
        refreshUser: vi.fn(),
      });

      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/app/dashboard" element={<div>Dashboard Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain('Dashboard Content');
      expect(html).not.toContain('Authenticating Session');
    });
  });
});
