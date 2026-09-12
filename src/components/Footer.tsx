import React from 'react';
import { Shield, Cpu, Lock } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: 'home' | 'how-it-works' | 'analysis' | 'about') => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-dark-950 border-t border-dark-800 text-slate-400 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Brand & Mission */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg text-slate-100">
              HESI<span className="text-cyan-400">-NET</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-dark-900 border border-dark-750 text-slate-300 font-mono">
              Research Platform
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            A computer-vision research platform designed to capture and acquire live visual behavioral data during human decision-making workflows.
          </p>
        </div>

        {/* System Navigation Links */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-semibold uppercase text-slate-300 tracking-wider">
            Navigation
          </h4>
          <div className="flex flex-wrap gap-4 text-xs font-medium">
            <button onClick={() => setActiveTab('home')} className="hover:text-cyan-400 transition-colors">
              Home
            </button>
            <button onClick={() => setActiveTab('how-it-works')} className="hover:text-cyan-400 transition-colors">
              How It Works
            </button>
            <button onClick={() => setActiveTab('analysis')} className="hover:text-cyan-400 transition-colors">
              Live Camera Feed
            </button>
            <button onClick={() => setActiveTab('about')} className="hover:text-cyan-400 transition-colors">
              Research Scope
            </button>
          </div>
        </div>

        {/* Security & Architecture Specs */}
        <div className="space-y-2 font-mono text-xs text-slate-400">
          <h4 className="font-semibold uppercase text-slate-300 tracking-wider">
            Security & Specs
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>WebRTC Browser MediaStream API</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Cloud Video Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Model Adapter Contract Layer</span>
            </div>
          </div>
          <div className="pt-2 text-[11px] text-slate-400">
            © {new Date().getFullYear()} HESI-NET. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
};
