import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, VideoOff, Activity, Mic, Brain,
  ShieldCheck, ArrowRight, CheckCircle2, Play, Square, Loader2
} from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { CameraPermissionModal } from '../components/CameraPermissionModal';
import { CameraErrorView } from '../components/CameraErrorView';
import { SessionService } from '../services/sessionService';
import type { TabType } from '../App';

interface AnalysisPageProps {
  setActiveTab: (tab: TabType) => void;
}

const processSteps = [
  { icon: Camera,       label: 'Capture',    sub: 'Get your session' },
  { icon: Activity,     label: 'Analyze',    sub: 'AI processes data' },
  { icon: Brain,        label: 'Understand', sub: 'Detect hesitation' },
  { icon: CheckCircle2, label: 'Support',    sub: 'Get guidance' },
];

const Waveform: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex items-end gap-[2px] h-6">
    {[8,12,18,10,22,14,8,16,12,20,10,16,8,14,12,18,10].map((h, i) => (
      <div
        key={i}
        style={{
          width: '3px',
          height: active ? `${h}px` : '4px',
          borderRadius: 2,
          background: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
          animation: active ? `wave-pulse ${0.6 + (i % 4) * 0.1}s ease-in-out infinite` : 'none',
          animationDelay: `${i * 0.06}s`,
          transition: 'height 0.2s',
        }}
      />
    ))}
  </div>
);

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ setActiveTab }) => {
  const {
    status: cameraStatus,
    stream,
    resolution,
    error,
    startCamera,
    stopCamera,
  } = useCamera();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  type AnalysisPhase = 'idle' | 'recording' | 'analyzing' | 'results';
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>('idle');
  const [sessionTime,   setSessionTime]   = useState<number>(0);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Timer while recording
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (analysisPhase === 'recording') {
      interval = setInterval(() => setSessionTime((p) => p + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [analysisPhase]);

  // Simulate analysis then show results
  useEffect(() => {
    if (analysisPhase === 'analyzing') {
      const t = setTimeout(() => {
        setAnalysisPhase('results');
        stopCamera();
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [analysisPhase, stopCamera]);

  const handleEnableCamera  = useCallback(() => startCamera(), [startCamera]);
  const handleStartRecording = useCallback(() => { setSessionTime(0); setAnalysisPhase('recording'); }, []);
  const handleStopRecording  = useCallback(() => setAnalysisPhase('analyzing'), []);
  const handleNewAnalysis    = useCallback(() => { setAnalysisPhase('idle'); }, []);

  const isLive      = cameraStatus === 'active' && analysisPhase === 'recording';
  const showCamera  = cameraStatus === 'active' && (analysisPhase === 'idle' || analysisPhase === 'recording');

  // Step active states
  const stepActive = [
    cameraStatus === 'active' || cameraStatus === 'requesting',
    analysisPhase === 'recording' || analysisPhase === 'analyzing',
    analysisPhase === 'analyzing' || analysisPhase === 'results',
    analysisPhase === 'results',
  ];

  const indicators = [
    { label: 'Facial Indicators',   val: 76, status: 'High Confidence', color: 'var(--color-primary)' },
    { label: 'Audio Indicators',    val: 45, status: 'Moderate',         color: 'var(--color-success)' },
    { label: 'Behavior Indicators', val: 82, status: 'Strong Signals',   color: 'var(--color-secondary)' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="badge badge-primary" style={{ fontSize: '10px' }}><Brain size={12} /> HESINET</span>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>🤖 AI POWERED</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Live Analysis <span className="text-gradient-primary">Interface</span>
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4, maxWidth: 400, lineHeight: 1.5 }}>
            AI models analyze your facial expressions, voice and behavior in real-time to detect hesitation signals.
          </p>
        </div>

        {/* 4-step process stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {processSteps.map((step, i) => {
            const Icon = step.icon;
            const active = stepActive[i];
            return (
              <React.Fragment key={step.label}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: active ? 'var(--color-primary-dim)' : 'var(--surface-raised)',
                      border: active ? '1.5px solid rgba(59,130,246,0.4)' : '1.5px solid var(--border-subtle)',
                      boxShadow: active ? '0 0 12px rgba(59,130,246,0.25)' : 'none',
                      transition: 'all var(--transition-base)',
                    }}
                  >
                    <Icon size={18} style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                    {step.label}
                  </span>
                </div>
                {i < processSteps.length - 1 && (
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)', gap: 20, minHeight: 480 }}>

        {/* ── Left: Camera Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="surface-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

            {/* Toolbar */}
            <div style={{ height: 48, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-overlay)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Camera size={14} style={{ color: 'var(--color-primary)' }} />
                Session Viewport
                {analysisPhase === 'recording' && (
                  <span className="badge badge-error" style={{ fontSize: '9px', marginLeft: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: 'pulse 1.5s infinite' }} />
                    REC
                  </span>
                )}
              </div>
              {showCamera && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-success)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Camera size={11} /> CAM ON</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mic size={11} /> MIC ON</span>
                  <span className="badge badge-muted" style={{ padding: '2px 6px' }}>{SessionService.formatDuration(sessionTime)}</span>
                </div>
              )}
            </div>

            {/* Viewport */}
            <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>

              {cameraStatus === 'idle' && (
                <div style={{ padding: 24, width: '100%', maxWidth: 400 }}>
                  <CameraPermissionModal onEnable={handleEnableCamera} onCancel={() => setActiveTab('home')} />
                </div>
              )}

              {cameraStatus === 'requesting' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>Requesting camera access...</span>
                </div>
              )}

              {(cameraStatus === 'denied' || cameraStatus === 'error' || cameraStatus === 'unavailable' || cameraStatus === 'unsupported') && (
                <div style={{ padding: 24, width: '100%', maxWidth: 480 }}>
                  <CameraErrorView error={error} onRetry={handleEnableCamera} />
                </div>
              )}

              {cameraStatus === 'stopped' && (
                <div style={{ textAlign: 'center' }}>
                  <VideoOff size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.4, display: 'block' }} />
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 16 }}>Camera stopped.</p>
                  <button className="btn-primary" onClick={handleEnableCamera}>
                    <Camera size={14} /> Re-enable Camera
                  </button>
                </div>
              )}

              {/* Live video */}
              {showCamera && (
                <video
                  ref={videoRef}
                  autoPlay playsInline muted
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
              )}

              {/* Face tracking overlay when recording */}
              {isLive && (
                <>
                  {resolution && (
                    <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                      {resolution.width}x{resolution.height} 30FPS
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '15%', left: '25%', width: '50%', height: '65%', border: '2px solid rgba(34,211,238,0.4)' }}>
                    {(['tl','tr','bl','br'] as const).map((c) => (
                      <div key={c} style={{
                        position: 'absolute', width: 16, height: 16,
                        ...(c[0]==='t' ? { top: -2, borderTop: '3px solid #22d3ee' } : { bottom: -2, borderBottom: '3px solid #22d3ee' }),
                        ...(c[1]==='l' ? { left: -2, borderLeft: '3px solid #22d3ee' } : { right: -2, borderRight: '3px solid #22d3ee' }),
                      }} />
                    ))}
                    <div style={{ position: 'absolute', top: '30%', left: '30%', width: 5, height: 5, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 6px #22d3ee' }} />
                    <div style={{ position: 'absolute', top: '30%', right: '30%', width: 5, height: 5, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 6px #22d3ee' }} />
                    <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 6px #22d3ee' }} />
                  </div>
                </>
              )}

              {/* Analyzing overlay */}
              {analysisPhase === 'analyzing' && (
                <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', animation: 'spin 3s linear infinite' }}>
                      <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeDasharray="70 213" strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Brain size={28} style={{ color: 'var(--color-primary)' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>Processing Signals...</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>Synthesizing multimodal behavioral data</p>
                  </div>
                </div>
              )}
            </div>

            {/* Control bar — only when camera is on and not in analysis/results */}
            {cameraStatus === 'active' && (analysisPhase === 'idle' || analysisPhase === 'recording') && (
              <div style={{ height: 60, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-overlay)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: analysisPhase === 'recording' ? 'var(--color-error)' : 'var(--text-muted)',
                    boxShadow: analysisPhase === 'recording' ? '0 0 8px var(--color-error)' : 'none',
                    animation: analysisPhase === 'recording' ? 'pulse 1.5s infinite' : 'none',
                  }} />
                  <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
                    {analysisPhase === 'recording' ? 'Acquiring data...' : 'Camera ready'}
                  </span>
                  {analysisPhase === 'recording' && <Waveform active={true} />}
                </div>
                {analysisPhase === 'recording' ? (
                  <button className="btn-danger" onClick={handleStopRecording}>
                    <Square size={13} fill="currentColor" /> Stop & Analyze
                  </button>
                ) : (
                  <button className="btn-primary" onClick={handleStartRecording}>
                    <Play size={13} fill="currentColor" /> Start Capture
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Privacy banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-success-dim)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <ShieldCheck size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)' }}>Your privacy matters. </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Video and audio are processed in memory only — never stored or uploaded.</span>
            </div>
            <button className="btn-ghost" onClick={() => setActiveTab('how-it-works')} style={{ fontSize: '10px', padding: '4px 8px' }}>
              Learn More <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* ── Right: Results Panel ── */}
        <div className="surface-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Live Results</h3>
            {isLive && (
              <span className="badge badge-success" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: 'pulse 1.5s infinite' }} />
                Real-time
              </span>
            )}
          </div>

          {/* Empty / processing state */}
          {analysisPhase !== 'results' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12 }}>
              <Activity size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <div>
                <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {analysisPhase === 'analyzing' ? 'Processing...' : 'No Data Yet'}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 220, margin: '4px auto 0', lineHeight: 1.5 }}>
                  {analysisPhase === 'recording'
                    ? 'Recording in progress. Stop to analyze.'
                    : analysisPhase === 'analyzing'
                    ? 'Synthesizing signals, please wait...'
                    : 'Enable your camera and start a capture session.'}
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {analysisPhase === 'results' && (
            <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {indicators.map((ind, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{ind.label}</span>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: ind.color }}>{ind.val}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ind.val}%`, background: ind.color, borderRadius: 3, boxShadow: `0 0 6px ${ind.color}88`, transition: 'width 1.2s ease-out' }} />
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 5 }}>
                    Confidence: <span style={{ color: ind.color }}>{ind.status}</span>
                  </p>
                </div>
              ))}

              <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Analysis complete. MIRA can help you understand these signals.
                </p>
                <button className="btn-primary" onClick={() => setActiveTab('mira')} style={{ justifyContent: 'center' }}>
                  <Brain size={15} /> Discuss with MIRA
                </button>
                <button className="btn-ghost" onClick={handleNewAnalysis} style={{ justifyContent: 'center' }}>
                  Run New Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
