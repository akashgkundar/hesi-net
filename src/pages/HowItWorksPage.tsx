import React, { useState } from 'react';
import { Camera, Layers, ArrowRight, Cpu, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface HowItWorksPageProps {
  setActiveTab: (tab: 'home' | 'how-it-works' | 'analysis' | 'about') => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ setActiveTab }) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps = [
    {
      num: '01',
      title: 'Camera Access',
      subtitle: 'Explicit User Permission',
      status: 'AVAILABLE NOW',
      isFuture: false,
      icon: Camera,
      description: 'Permission is requested strictly for video input (`video: true`), without audio or microphone access.',
      details: [
        'Uses WebRTC `navigator.mediaDevices.getUserMedia()`',
        'Camera stream initializes only after user consent',
      ],
    },
    {
      num: '02',
      title: 'Visual Capture',
      subtitle: 'Live Camera Feed Stream',
      status: 'AVAILABLE NOW',
      isFuture: false,
      icon: Layers,
      description: 'Displays the live camera stream in real time with an overlay face reticle frame for optimal visual alignment.',
      details: [
        'Live 30fps viewport preview with resolution detection',
        'Animated reticle guide over live video feed',
      ],
    },
    {
      num: '03',
      title: 'Model Input',
      subtitle: 'Stream Payload Packaging',
      status: 'AVAILABLE NOW',
      isFuture: false,
      icon: ArrowRight,
      description: 'Captured visual stream metadata (resolution, frame timestamp, stream status) is formatted through the adapter layer.',
      details: [
        'Structured TypeScript contract definition (`ModelContractSpec`)',
        'Standardized payload format ready for WebSocket/REST endpoints',
      ],
    },
    {
      num: '04',
      title: 'Hesitation Detection',
      subtitle: 'Model Inference',
      status: 'FUTURE STAGE',
      isFuture: true,
      icon: Cpu,
      description: 'Trained computer-vision models will process visual frames to evaluate micro-behavioral decision hesitation patterns.',
      details: [
        'Will run on separate Python / FastAPI / WebSocket server or ONNX runtime',
        'Intentionally disconnected in current frontend stage',
      ],
    },
    {
      num: '05',
      title: 'Result',
      subtitle: 'Interface Presentation',
      status: 'FUTURE STAGE',
      isFuture: true,
      icon: CheckCircle2,
      description: 'The future model returns evaluation outputs back to the HESI-NET interface.',
      details: [
        'Hesitation metrics and visual cue breakdowns',
        'Seamless integration without modifying frontend UI',
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-dark-900 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Workflow Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">
          How HESI-NET Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          The 5-stage data flow from camera acquisition to future computer-vision model evaluation.
        </p>
      </div>

      {/* Scope Banner */}
      <div className="p-4 bg-dark-900 border border-cyan-500/30 rounded-2xl max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            Steps 01-03 represent the current camera frontend. Steps 04-05 represent future backend model integration.
          </span>
        </div>
        <button
          onClick={() => setActiveTab('analysis')}
          className="shrink-0 px-4 py-2 rounded-lg font-semibold bg-cyan-500 hover:bg-cyan-400 text-dark-950 transition-colors"
        >
          Try Camera Feed
        </button>
      </div>

      {/* 5-Step Linear Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = selectedStep === idx + 1;
          return (
            <button
              key={step.num}
              onClick={() => setSelectedStep(idx + 1)}
              className={`p-4 rounded-xl text-left transition-all border flex flex-col justify-between space-y-3 ${
                isSelected
                  ? step.isFuture
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-lg'
                    : 'bg-cyan-950/20 border-cyan-400 shadow-lg'
                  : 'bg-dark-900 border-dark-750 hover:bg-dark-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-slate-400">{step.num}</span>
                <Icon className={`w-4 h-4 ${step.isFuture ? 'text-amber-400' : 'text-cyan-400'}`} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-100">{step.title}</h4>
                <span className={`text-[9px] font-mono block mt-0.5 ${step.isFuture ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {step.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Step Spec Card */}
      {(() => {
        const current = steps[selectedStep - 1];
        const Icon = current.icon;
        return (
          <div className="bg-dark-900 border border-dark-750 rounded-2xl p-6 max-w-3xl mx-auto space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-dark-800 pb-3">
              <div className={`p-3 rounded-xl border ${current.isFuture ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-slate-400 font-bold">STAGE {current.num}</span>
                <h3 className="text-lg font-bold text-slate-100">{current.title} — {current.subtitle}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {current.description}
            </p>

            <div className="space-y-1.5">
              {current.details.map((detail, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-dark-950 p-2 rounded-lg border border-dark-800">
                  <div className={`w-1.5 h-1.5 rounded-full ${current.isFuture ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

    </div>
  );
};
