import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BlueLoopLogo } from '../common/BlueLoopLogo';

export const LandingNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.getElementById(id);
    if (targetElement) {
      const headerOffset = 84;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md py-3 shadow-xs border-b border-slate-200/80'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center group">
            <BlueLoopLogo size="md" variant="brand" showWordmark showSubtitle />
          </Link>

          {/* Desktop Navigation Links with Smooth Offset Scrolling */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-ocean-950 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#the-problem"
              onClick={(e) => scrollToSection(e, 'the-problem')}
              className="hover:text-ocean-950 transition-colors"
            >
              The Problem
            </a>
            <a
              href="#product-preview"
              onClick={(e) => scrollToSection(e, 'product-preview')}
              className="hover:text-ocean-950 transition-colors"
            >
              Platform
            </a>
            <a
              href="#impact"
              onClick={(e) => scrollToSection(e, 'impact')}
              className="hover:text-ocean-950 transition-colors"
            >
              Impact Ledger
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-ocean-950 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-ocean-900 hover:bg-ocean-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all group"
            >
              <span>Explore Demo</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-1 rounded-md bg-ocean-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
            >
              Demo
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-600 hover:text-ink rounded-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200 bg-white rounded-xl p-4 shadow-elevated space-y-3">
            <nav className="flex flex-col space-y-2.5 text-xs font-semibold text-slate-600">
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="py-1.5 hover:text-ocean-950"
              >
                How It Works
              </a>
              <a
                href="#the-problem"
                onClick={(e) => scrollToSection(e, 'the-problem')}
                className="py-1.5 hover:text-ocean-950"
              >
                The Problem
              </a>
              <a
                href="#product-preview"
                onClick={(e) => scrollToSection(e, 'product-preview')}
                className="py-1.5 hover:text-ocean-950"
              >
                Platform
              </a>
              <a
                href="#impact"
                onClick={(e) => scrollToSection(e, 'impact')}
                className="py-1.5 hover:text-ocean-950"
              >
                Impact Ledger
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                to="/app/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-white bg-ocean-900 rounded-lg hover:bg-ocean-800"
              >
                Explore Live Demo
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
