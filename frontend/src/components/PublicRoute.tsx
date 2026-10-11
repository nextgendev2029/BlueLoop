import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, RefreshCw } from 'lucide-react';

export interface PublicRouteProps {
  children?: React.ReactNode;
}

/**
 * Reusable route guard for public-only routes (Landing, Login, Signup).
 * - Unauthenticated users can view the public route content.
 * - Authenticated users are redirected to the authenticated workspace dashboard.
 * - Shows an authenticating loading state while session restoration is pending.
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

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

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
