import React from 'react';
import { Info, ShieldCheck, Cpu, Eye, Layers, BookOpen } from 'lucide-react';

interface AboutPageProps {
  setActiveTab?: (tab: 'home' | 'how-it-works' | 'analysis' | 'about') => void;
}

export const AboutPage: React.FC<AboutPageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-dark-900 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Research Platform Specifications</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">
          About HESI-NET
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Visual Decision Hesitation Detection using Computer Vision
        </p>
      </div>

      {/* Abstract */}
      <div className="bg-dark-900 border border-dark-750 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          <span>Project Abstract & Architecture</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>HESI-NET</strong> is a research platform developed to facilitate computer-vision research into <span className="text-cyan-300">visual decision behavior</span> and temporal behavioral pattern acquisition.
          </p>
          <p>
            The platform provides a browser-based camera acquisition interface designed to capture live visual streams from standard webcams. This web application forms the front-end user experience and camera stream pipeline for the broader research architecture.
          </p>
        </div>

        <div className="p-3.5 bg-dark-950 rounded-xl border border-cyan-500/30 text-xs text-slate-300 space-y-1">
          <strong className="text-cyan-400 font-mono block">SCOPE BOUNDARY:</strong>
          <p className="leading-relaxed">
            The actual hesitation-detection capability will be performed by trained computer-vision models connected separately. This website operates strictly as the front-end camera acquisition layer.
          </p>
        </div>
      </div>

      {/* 3 Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-dark-900 border border-dark-750 p-5 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">Visual Cues</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Studying non-verbal cues and micro-facial temporal dynamics during decision workflows.
          </p>
        </div>

        <div className="bg-dark-900 border border-dark-750 p-5 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">Model Adapter</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Modular interface contracts ensuring seamless connection with future neural network backends.
          </p>
        </div>

        <div className="bg-dark-900 border border-dark-750 p-5 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">Privacy First</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Zero cloud video uploads, video-only permissions (`video: true`), and transparent controls.
          </p>
        </div>

      </div>

      {/* Roadmap */}
      <div className="bg-dark-900 border border-dark-750 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Integration Roadmap</span>
        </h2>

        <div className="space-y-2 font-mono text-xs">
          <div className="p-3 bg-dark-950 rounded-xl border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
            <span>Stage 1: HESI-NET Web Frontend & Camera Stream</span>
            <span className="font-bold">COMPLETED</span>
          </div>

          <div className="p-3 bg-dark-950 rounded-xl border border-cyan-500/30 text-cyan-300 flex items-center justify-between">
            <span>Stage 2: Model Adapter Protocol (WebSocket/REST)</span>
            <span className="font-bold">READY</span>
          </div>

          <div className="p-3 bg-dark-950 rounded-xl border border-amber-500/30 text-amber-400 flex items-center justify-between">
            <span>Stage 3: Trained Computer-Vision Model Connection</span>
            <span className="font-bold">FUTURE STAGE</span>
          </div>
        </div>
      </div>

    </div>
  );
};
