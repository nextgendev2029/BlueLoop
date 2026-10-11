import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { DemandsPage } from './pages/DemandsPage';
import { AllocationsPage } from './pages/AllocationsPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { ImpactPage } from './pages/ImpactPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public-Only Routes with Authenticated-User Redirect */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* Protected Internal Application Workspace under /app */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="demands" element={<DemandsPage />} />
              <Route path="allocations" element={<AllocationsPage />} />
              <Route path="deliveries" element={<DeliveriesPage />} />
              <Route path="impact" element={<ImpactPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          {/* Legacy Root Path Redirects to /app/* */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/suppliers" element={<Navigate to="/app/suppliers" replace />} />
          <Route path="/demands" element={<Navigate to="/app/demands" replace />} />
          <Route path="/allocations" element={<Navigate to="/app/allocations" replace />} />
          <Route path="/deliveries" element={<Navigate to="/app/deliveries" replace />} />
          <Route path="/impact" element={<Navigate to="/app/impact" replace />} />
          <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

          {/* Catch-all Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
