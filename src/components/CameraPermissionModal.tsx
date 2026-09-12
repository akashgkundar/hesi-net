import React from 'react';
import { Camera } from 'lucide-react';

interface CameraPermissionModalProps {
  onEnable: () => void;
  onCancel: () => void;
}

export const CameraPermissionModal: React.FC<CameraPermissionModalProps> = ({ onEnable, onCancel }) => {
  return (
    <div className="bg-dark-900 border border-dark-700/90 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl space-y-6">
      
      {/* Icon & Title */}
      <div className="flex items-start gap-4">
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
          <Camera className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Camera Access Required
          </h2>
          <p className="text-xs font-mono text-cyan-400">
            HESI-NET Camera Acquisition Layer
          </p>
        </div>
      </div>

      {/* Primary Message */}
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed bg-dark-950/60 p-4 rounded-xl border border-dark-800">
        <p>
          HESI-NET needs access to your device camera to capture visual information for the analysis process.
        </p>
        <p className="text-slate-400 text-xs">
          Camera access will only begin after you explicitly give permission in your browser prompt.
        </p>
      </div>



      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-dark-800">
        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium bg-dark-800 hover:bg-dark-750 text-slate-300 border border-dark-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onEnable}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-dark-950 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>Enable Camera</span>
        </button>
      </div>

    </div>
  );
};
