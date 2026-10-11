import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplet, ArrowRight, Menu, X } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav py-3.5 shadow-subtle' : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#123B56] text-white shadow-xs group-hover:bg-[#1677B8] transition-colors">
              <Droplet className="h-4.5 w-4.5 text-[#24B8C7]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#172B36]">
                BlueLoop
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-medium uppercase tracking-wider text-[#1677B8] px-1.5 py-0.5 rounded-sm bg-[#E8F5F8]">
                Water Reuse Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#637680]">
            <a href="#how-it-works" className="hover:text-[#172B36] transition-colors">
              How It Works
            </a>
            <a href="#the-problem" className="hover:text-[#172B36] transition-colors">
              The Problem
            </a>
            <a href="#product-preview" className="hover:text-[#172B36] transition-colors">
              Platform
            </a>
            <a href="#impact" className="hover:text-[#172B36] transition-colors">
              Impact Ledger
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-2 text-xs font-semibold text-[#172B36] hover:text-[#1677B8] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#123B56] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1677B8] transition-all group"
            >
              <span>Explore Demo</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-1 rounded-md bg-[#123B56] px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
            >
              Demo
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#637680] hover:text-[#172B36] rounded-md"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-[#DCE7EB] bg-white rounded-xl p-4 shadow-elevated space-y-3">
            <nav className="flex flex-col space-y-2 text-xs font-medium text-[#637680]">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#172B36]"
              >
                How It Works
              </a>
              <a
                href="#the-problem"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#172B36]"
              >
                The Problem
              </a>
              <a
                href="#product-preview"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#172B36]"
              >
                Platform Preview
              </a>
              <a
                href="#impact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#172B36]"
              >
                Impact Accounting
              </a>
            </nav>
            <div className="pt-2 border-t border-[#E8F0F3] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-xs font-semibold text-[#172B36]"
              >
                Sign In
              </Link>
              <Link
                to="/app/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center rounded-lg bg-[#123B56] py-2 text-xs font-semibold text-white"
              >
                Explore Live Demo Platform
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
