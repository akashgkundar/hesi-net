import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle2, Cpu, Crosshair } from 'lucide-react';

export const ChipDesignerAnimation: React.FC = () => {
  const [stage, setStage] = useState<'idle' | 'moving' | 'aligning' | 'locked'>('idle');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isPlaying) return;

    // Sequence controller for chip movement -> alignment -> locked in position
    const timer1 = setTimeout(() => setStage('moving'), 800);
    const timer2 = setTimeout(() => setStage('aligning'), 2600);
    const timer3 = setTimeout(() => setStage('locked'), 4200);

    // Loop after lock pause
    const timerLoop = setTimeout(() => {
      setStage('idle');
    }, 7500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerLoop);
    };
  }, [stage, isPlaying]);

  const handleReset = () => {
    setStage('idle');
    setIsPlaying(true);
  };

  return (
    <div className="bg-dark-900 border border-dark-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      
      {/* Background Micro-Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-dark-700/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-base">
                Decision Alignment Visualizer
              </h3>
              <span className="text-[10px] font-mono uppercase bg-dark-800 text-cyan-400 px-2 py-0.5 rounded border border-dark-700">
                Semiconductor Analogy
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulating spatial component precision: <span className="text-cyan-300">Movement → Alignment → Final Lock</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-dark-800 border border-dark-700 hover:border-cyan-500/50 text-slate-300 hover:text-slate-100 flex items-center gap-1.5 transition-all"
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{isPlaying ? 'Looping' : 'Paused'}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-dark-800 border border-dark-700 hover:border-cyan-500/50 text-slate-300 hover:text-slate-100 flex items-center gap-1.5 transition-all"
            title="Re-trigger alignment sequence"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-align</span>
          </button>
        </div>
      </div>

      {/* Stage Container Canvas */}
      <div className="relative h-64 sm:h-72 w-full bg-dark-950 rounded-xl border border-dark-800 flex items-center justify-center overflow-hidden">
        
        {/* Semiconductor Board Substrate */}
        <div className="relative w-72 h-48 rounded-lg bg-dark-900 border-2 border-dark-700 flex items-center justify-center p-4">
          
          {/* Circuit Trace Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <svg className="w-full h-full" viewBox="0 0 300 200">
              <path d="M 20 20 L 100 20 L 130 60 L 170 60 L 200 20 L 280 20" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
              <path d="M 20 180 L 100 180 L 130 140 L 170 140 L 200 180 L 280 180" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
              <path d="M 20 100 L 80 100" stroke="#3b82f6" strokeWidth="1" fill="none" />
              <path d="M 220 100 L 280 100" stroke="#3b82f6" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* Target Socket Frame (Destination on board) */}
          <div
            className={`w-36 h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all duration-700 relative ${
              stage === 'locked'
                ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                : stage === 'aligning'
                ? 'border-cyan-500/60 bg-dark-800/80'
                : 'border-slate-700 bg-dark-950/60'
            }`}
          >
            {/* Target Reticle Crosshairs */}
            <div className="absolute -top-2 -left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute -top-2 -right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute -bottom-2 -right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            <span className="text-[10px] font-mono text-slate-400 mb-1">TARGET SOCKET</span>
            <span className="text-[9px] font-mono text-cyan-400/80">POS: [X:150, Y:100]</span>

            {/* Socket Pin Pads */}
            <div className="grid grid-cols-4 gap-1.5 mt-2 opacity-50">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-sm bg-dark-700 border border-slate-600" />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Semiconductor Micro-Component */}
        <div
          className={`absolute transition-all ease-in-out duration-1000 ${
            stage === 'idle'
              ? 'translate-x-32 -translate-y-16 scale-90 rotate-12 opacity-70'
              : stage === 'moving'
              ? 'translate-x-12 -translate-y-6 scale-95 rotate-6 opacity-90'
              : stage === 'aligning'
              ? 'translate-x-0 translate-y-0 scale-100 rotate-0 opacity-100'
              : 'translate-x-0 translate-y-0 scale-100 rotate-0 opacity-100 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
          }`}
        >
          <div
            className={`w-32 h-24 rounded-lg p-2 flex flex-col justify-between transition-colors duration-500 border-2 ${
              stage === 'locked'
                ? 'bg-dark-900 border-cyan-400 text-cyan-300'
                : stage === 'aligning'
                ? 'bg-dark-850 border-cyan-500 text-slate-200'
                : 'bg-dark-800 border-slate-500 text-slate-400'
            }`}
          >
            {/* Component Header */}
            <div className="flex items-center justify-between border-b border-dark-700/80 pb-1">
              <div className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-mono font-bold tracking-tight">IC-DECISION</span>
              </div>
              <span className="text-[9px] font-mono px-1 rounded bg-dark-950 text-cyan-400">
                REV-A
              </span>
            </div>

            {/* Pins Graphic */}
            <div className="flex items-center justify-around py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[9px] font-mono text-center">
                {stage === 'locked'
                  ? 'POSITION LOCKED'
                  : stage === 'aligning'
                  ? 'ALIGNING VECTOR'
                  : 'STEERING GRID'}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-dark-700/80">
              <span>STATE</span>
              <span className={`font-semibold ${stage === 'locked' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stage.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Alignment Vector Laser Trace Line */}
        {stage !== 'locked' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line
              x1="65%"
              y1="35%"
              x2="50%"
              y2="50%"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Success Snap Flash Banner */}
        {stage === 'locked' && (
          <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 backdrop-blur-md animate-fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Optimal Component Alignment Locked</span>
          </div>
        )}
      </div>

      {/* Caption Footnote */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span>Visual metaphor: Finding precise decision placement without hesitation.</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Status: <strong className="text-slate-200">{stage}</strong>
        </div>
      </div>

    </div>
  );
};
