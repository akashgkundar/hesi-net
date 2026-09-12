import React from 'react';
import { Cpu, WifiOff, CheckCircle, ArrowRight } from 'lucide-react';
import { ModelService } from '../services/modelService';

export const ModelPlaceholderCard: React.FC = () => {

  const notice = ModelService.getNotice();

  return (
    <div className="bg-dark-900 border border-dark-700/80 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Card Header & Status Badge */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-dark-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              Model Integration
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Backend Model Adapter Interface
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-950 border border-amber-500/30 text-amber-400 text-xs font-mono">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Not Connected</span>
        </div>
      </div>

      {/* Primary Mandatory Notice */}
      <div className="p-4 bg-dark-950/80 rounded-xl border border-dark-800 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold font-mono">
          <span>FUTURE INTEGRATION PLACEHOLDER</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {notice}
        </p>
      </div>

      {/* Integration Pipeline Diagram */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
          Target Integration Pipeline
        </span>

        <div className="p-3 bg-dark-950 rounded-xl border border-dark-800 flex items-center justify-between gap-2 text-xs font-mono text-slate-300 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0 text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>HESI-NET Camera</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="px-2 py-1 rounded bg-dark-800 border border-dark-700 text-slate-400 shrink-0">
            Frame Stream
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            Trained Model (Pending)
          </div>
        </div>
      </div>


    </div>
  );
};
