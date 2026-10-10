import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
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
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="demands" element={<DemandsPage />} />
          <Route path="allocations" element={<AllocationsPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="impact" element={<ImpactPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
