import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplet,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Building2,
  Factory,
  ShieldAlert,
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickLogin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoRoleLoading, setDemoRoleLoading] = useState<string | null>(null);

  // If already authenticated, redirect to workspace
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your corporate email and password.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid corporate email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'buyer' | 'supplier' | 'admin') => {
    setError(null);
    setDemoRoleLoading(role);
    try {
      await quickLogin(role);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed. Backend may be offline.');
    } finally {
      setDemoRoleLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col lg:flex-row antialiased">
      {/* Left Brand Panel (Split Screen) */}
      <div className="lg:w-1/2 bg-ocean-950 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-ocean-800">
        {/* Background Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-water-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-aqua-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg bg-water-600 flex items-center justify-center text-white shadow-sm group-hover:bg-water-500 transition-colors">
              <Droplet className="h-5 w-5" />
            </div>
            <span className="font-editorial text-2xl font-medium tracking-tight text-white">
              BlueLoop
            </span>
          </Link>
        </div>

        {/* Middle Brand Narrative */}
        <div className="my-12 lg:my-0 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-water-900/60 border border-water-500/30 text-aqua-300 text-xs font-mono mb-6">
            <Sparkles className="h-3 w-3" />
            Enterprise Water Allocation
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">
            Deterministic water intelligence for modern industry.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Screen certified treated-effluent streams against rigid chemical tolerances, optimize
            least-cost transport, and verify genuine physical freshwater displacement.
          </p>

          <div className="mt-8 space-y-3 pt-6 border-t border-ocean-800/80">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-forest-400 shrink-0" />
              <span>100% Fail-closed chemical gatekeeper</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-forest-400 shrink-0" />
              <span>Haversine & road transport cost modeling</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-forest-400 shrink-0" />
              <span>Multi-tenant organization data isolation & RBAC</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="relative z-10 text-xs text-slate-400">
          <span>Industrial Water Reuse Platform - Production & Demo Authentication</span>
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Quick Demo Access Callout Banner */}
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-water-50 to-aqua-50 border border-water-200/80 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-water-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-water-900">
                  Quick Demo Access
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Authenticate instantly using seeded test profiles with verified permissions:
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={demoRoleLoading !== null || isSubmitting}
                    onClick={() => handleQuickDemo('buyer')}
                    className="p-2.5 rounded-lg bg-white border border-water-300 hover:border-water-500 hover:bg-water-50/50 text-left transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 text-ink font-semibold text-[11px]">
                      <Building2 className="h-3.5 w-3.5 text-water-600" />
                      <span>Buyer</span>
                    </div>
                    <span className="block text-[10px] text-slate-500 mt-0.5 truncate">
                      Apex Centers
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={demoRoleLoading !== null || isSubmitting}
                    onClick={() => handleQuickDemo('supplier')}
                    className="p-2.5 rounded-lg bg-white border border-water-300 hover:border-water-500 hover:bg-water-50/50 text-left transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 text-ink font-semibold text-[11px]">
                      <Factory className="h-3.5 w-3.5 text-water-600" />
                      <span>Supplier</span>
                    </div>
                    <span className="block text-[10px] text-slate-500 mt-0.5 truncate">
                      Maraimalai Tech
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={demoRoleLoading !== null || isSubmitting}
                    onClick={() => handleQuickDemo('admin')}
                    className="p-2.5 rounded-lg bg-white border border-water-300 hover:border-water-500 hover:bg-water-50/50 text-left transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 text-ink font-semibold text-[11px]">
                      <ShieldAlert className="h-3.5 w-3.5 text-water-600" />
                      <span>Admin</span>
                    </div>
                    <span className="block text-[10px] text-slate-500 mt-0.5 truncate">
                      Platform Ops
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Sign in to your account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Or{' '}
              <Link to="/signup" className="text-water-600 hover:text-water-700 font-medium">
                register a facility stream or buyer demand
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-700 mb-1">
                Corporate Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-water-500 focus:ring-1 focus:ring-water-500 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-700"
                >
                  Password
                </label>
                <a
                  href="#credentials-info"
                  onClick={(e) => {
                    e.preventDefault();
                    setEmail(DEMO_CREDENTIALS.buyer.email);
                    setPassword(DEMO_CREDENTIALS.buyer.password);
                  }}
                  className="text-xs text-water-600 hover:text-water-700"
                >
                  Fill demo buyer credentials
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-water-500 focus:ring-1 focus:ring-water-500 text-sm outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-water-600 focus:ring-water-500"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || demoRoleLoading !== null}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-ocean-900 hover:bg-ocean-800 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Need an enterprise organization account?{' '}
              <Link
                to="/signup"
                className="text-water-600 hover:text-water-700 font-semibold underline underline-offset-2"
              >
                Register an organization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
