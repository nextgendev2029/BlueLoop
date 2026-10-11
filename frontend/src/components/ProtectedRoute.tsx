import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, RefreshCw } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-xl bg-water-600 text-white flex items-center justify-center shadow-md mb-4 animate-bounce">
          <Droplet className="h-6 w-6" />
        </div>
        <h2 className="font-editorial text-xl font-bold text-ink">
          Authenticating Session
        </h2>
        <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 justify-center">
          <RefreshCw className="h-3 w-3 animate-spin text-water-600" />
          Verifying credentials with BlueLoop security core...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
