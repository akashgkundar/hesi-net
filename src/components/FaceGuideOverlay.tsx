import React from 'react';
import { User, Scan } from 'lucide-react';

interface FaceGuideOverlayProps {
  isActive: boolean;
  isSessionActive: boolean;
}

export const FaceGuideOverlay: React.FC<FaceGuideOverlayProps> = ({ isActive, isSessionActive }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 select-none">
      
      {/* Corner Reticle Ticks */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400/80" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400/80" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400/80" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400/80" />

      {/* Oval Reticle Frame */}
      <div
        className={`relative w-48 sm:w-56 h-64 sm:h-72 rounded-[48%] border-2 face-guide-pulse transition-all duration-500 flex flex-col items-center justify-between p-6 overflow-hidden ${
          isSessionActive
            ? 'border-emerald-400/90 bg-emerald-950/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
            : 'border-cyan-400/70 bg-cyan-950/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
        }`}
      >
        {/* Sweep Laser Beam when active */}
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-scan" />

        {/* Top Alignment Indicator */}
        <div className="w-4 h-1 bg-cyan-400/80 rounded-full" />

        {/* Eye Line Reticle Axis */}
        <div className="w-full flex items-center justify-between opacity-40 my-auto">
          <div className="w-8 h-0.5 bg-cyan-400" />
          <User className="w-8 h-8 text-cyan-400/50" />
          <div className="w-8 h-0.5 bg-cyan-400" />
        </div>

        {/* Bottom Alignment Indicator */}
        <div className="w-4 h-1 bg-cyan-400/80 rounded-full" />
      </div>

      {/* Guide Badge */}
      <div className="mt-4 px-4 py-1.5 rounded-full bg-dark-950/85 backdrop-blur-md border border-cyan-500/30 text-slate-200 text-xs font-mono flex items-center gap-2 shadow-lg">
        <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>Position your face inside the frame</span>
      </div>

    </div>
  );
};
