import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Factory,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BlueLoopLogo } from '../components/common/BlueLoopLogo';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'supplier' | 'buyer'>('buyer');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to workspace
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !company.trim() || !email.trim() || !password.trim()) {
      setError('Please fill out all registration fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid corporate email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: fullName.trim(),
        company_name: company.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col lg:flex-row antialiased">
      {/* Left Brand Panel */}
      <div className="lg:w-1/2 bg-ocean-950 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-ocean-800">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-water-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-aqua-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center group">
            <BlueLoopLogo size="lg" variant="light" showWordmark showSubtitle />
          </Link>
        </div>

        <div className="my-12 lg:my-0 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-water-900/60 border border-water-500/30 text-aqua-300 text-xs font-mono mb-6">
            <Sparkles className="h-3 w-3" />
            Join the Clean Water Network
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">
            Close the loop on industrial water consumption.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Whether you operate an STP looking to monetize tertiary effluent, or an industrial
            facility seeking resilient, lower-cost process water, BlueLoop guarantees deterministic
            quality compliance.
          </p>

          <div className="mt-8 space-y-4 pt-6 border-t border-ocean-800/80">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs font-semibold text-aqua-300 uppercase tracking-wider mb-1 font-mono">
                For Effluent Producers
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Register discharge streams with lab assays, set ex-works pricing, and eliminate surface
                discharge penalties.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs font-semibold text-water-300 uppercase tracking-wider mb-1 font-mono">
                For Commercial Buyers
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Specify tolerance bands, discover nearby streams, and reduce municipal water
                procurement costs by up to 40%.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          <span>Industrial Water Reuse Platform - Multi-Tenant Account Registration</span>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Create your organization profile
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-water-600 hover:text-water-700 font-medium">
                Sign in
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
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Primary Organization Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    role === 'buyer'
                      ? 'bg-water-50 border-water-500 ring-1 ring-water-400'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building2
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      role === 'buyer' ? 'text-water-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <span className="block text-xs font-semibold text-ink">Commercial Buyer</span>
                    <span className="block text-[10px] text-slate-500">Cooling towers, boilers</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('supplier')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    role === 'supplier'
                      ? 'bg-water-50 border-water-500 ring-1 ring-water-400'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Factory
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      role === 'supplier' ? 'text-water-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <span className="block text-xs font-semibold text-ink">Effluent Supplier</span>
                    <span className="block text-[10px] text-slate-500">STP / ETP / Refinery</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Sarah Chen"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-water-500 focus:ring-1 focus:ring-water-500 text-sm outline-none"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-xs font-medium text-slate-700 mb-1">
                  Company / Entity
                </label>
                <input
                  id="company"
                  type="text"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Solventex Pharma Ltd"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-water-500 focus:ring-1 focus:ring-water-500 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signupEmail" className="block text-xs font-medium text-slate-700 mb-1">
                Corporate Email
              </label>
              <input
                id="signupEmail"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="s.chen@solventex.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-water-500 focus:ring-1 focus:ring-water-500 text-sm outline-none"
              />
            </div>

            <div>
              <label htmlFor="signupPassword" className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="signupPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters, 1 uppercase, 1 number"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-water-500 focus:ring-1 focus:ring-water-500 text-sm outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Must contain at least 8 characters, an uppercase letter, a lowercase letter, and a number.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-ocean-950 hover:bg-ocean-900 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Registering...' : 'Register Profile & Continue'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <Link
              to="/login"
              className="text-xs text-water-600 hover:text-water-700 font-semibold underline underline-offset-2"
            >
              Sign in with an existing account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
