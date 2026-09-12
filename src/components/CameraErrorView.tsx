import React from 'react';
import { AlertTriangle, RefreshCw, Sliders, MonitorOff, VideoOff } from 'lucide-react';
import type { CameraErrorDetails } from '../types/camera';

interface CameraErrorViewProps {
  error: CameraErrorDetails | null;
  onRetry: () => void;
}

export const CameraErrorView: React.FC<CameraErrorViewProps> = ({ error, onRetry }) => {
  const getIcon = () => {
    switch (error?.code) {
      case 'PERMISSION_DENIED':
        return <VideoOff className="w-10 h-10 text-amber-400" />;
      case 'DEVICE_NOT_FOUND':
        return <MonitorOff className="w-10 h-10 text-rose-400" />;
      case 'DEVICE_IN_USE':
        return <AlertTriangle className="w-10 h-10 text-amber-400" />;
      default:
        return <AlertTriangle className="w-10 h-10 text-rose-400" />;
    }
  };

  return (
    <div className="bg-dark-900 border border-dark-700/80 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-6 shadow-2xl">
      
      {/* Icon */}
      <div className="inline-flex p-4 rounded-2xl bg-dark-950 border border-dark-800 shadow-inner">
        {getIcon()}
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-100">
          {error?.title || 'Camera Unavailable'}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {error?.message || 'An error occurred while attempting to open your device camera.'}
        </p>
      </div>

      {/* Suggestion Box */}
      <div className="p-4 bg-dark-950/80 rounded-xl border border-dark-800 text-xs text-slate-400 text-left flex items-start gap-3">
        <Sliders className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200 block mb-0.5">Recommended Action:</strong>
          <span>{error?.suggestion || 'Check device permissions and try again.'}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-dark-800 hover:bg-dark-750 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>

    </div>
  );
};
