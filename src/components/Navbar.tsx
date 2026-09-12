import React, { useState } from 'react';
import { Camera, Menu, X, ChevronRight, Eye } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'how-it-works' | 'analysis' | 'about';
  setActiveTab: (tab: 'home' | 'how-it-works' | 'analysis' | 'about') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'about', label: 'About' },
  ] as const;

  const handleNav = (id: 'home' | 'how-it-works' | 'analysis' | 'about') => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-950/90 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Branding: Abstract H + Face/Vision + Network */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-lg p-1 transition-all"
            aria-label="HESI-NET Homepage"
          >
            <div className="relative w-10 h-10 rounded-lg bg-dark-900 border border-cyan-500/40 flex items-center justify-center group-hover:border-cyan-400 transition-colors shadow-sm">
              <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 5v14M20 5v14M4 12h16" strokeLinecap="round" />
                <rect x="8" y="8" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-70" />
                <circle cx="12" cy="12" r="1.5" fill="#38bdf8" />
              </svg>
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wider text-slate-100 font-mono">
                  HESI<span className="text-cyan-400">-NET</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-semibold bg-dark-800 text-cyan-400 border border-dark-700 rounded">
                  Research Lab
                </span>
              </div>
              <span className="text-[11px] text-slate-400 tracking-tight hidden sm:inline-block">
                Visual Decision Hesitation Detection
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-dark-900/80 p-1.5 rounded-xl border border-dark-750">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-dark-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-dark-800/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Primary Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => handleNav('analysis')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-dark-950 transition-all shadow-lg shadow-cyan-500/15 focus:outline-none focus:ring-2 focus:ring-cyan-400 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera Analysis</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-dark-900 text-slate-300 border border-dark-700 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-900 border-b border-dark-750 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg text-left transition-all ${
                  activeTab === item.id
                    ? 'bg-dark-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-dark-800/40'
                }`}
              >
                <span>{item.label}</span>
                {activeTab === item.id && <Eye className="w-4 h-4 text-cyan-400" />}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleNav('analysis')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-cyan-500 text-dark-950 hover:bg-cyan-400 transition-colors shadow-md"
            >
              <Camera className="w-5 h-5" />
              <span>Start Camera Analysis</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
