import React, { useState, useEffect, useRef } from 'react';
import { Scan, RotateCcw, AlertCircle, UserCheck } from 'lucide-react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { HesiNetService } from '../services/hesiNetService';

export const FaceScannerAnimation: React.FC = () => {
  const [_scanStep, setScanStep] = useState<'idle' | 'initializing' | 'scanning' | 'locked'>('initializing');
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [expressions, setExpressions] = useState<faceapi.FaceExpressions | null>(null);
  const [hesitationFlag, setHesitationFlag] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectIntervalRef = useRef<number | null>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setScanStep('scanning');
      } catch (err) {
        console.error('Failed to load face-api models', err);
      }
    };
    loadModels();
  }, []);

  // Face Detection Loop
  useEffect(() => {
    if (isScanning && modelsLoaded && webcamRef.current?.video) {
      detectIntervalRef.current = window.setInterval(async () => {
        const video = webcamRef.current?.video;
        if (video && video.readyState === 4) {
          const detections = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detections) {
            setFaceDetected(true);
            setScanStep('locked');
            setExpressions(detections.expressions);
            HesiNetService.pushDetections(detections.expressions);

            if (canvasRef.current) {
              const displaySize = { width: video.videoWidth, height: video.videoHeight };
              faceapi.matchDimensions(canvasRef.current, displaySize);
              const resizedDetections = faceapi.resizeResults(detections, displaySize);
              canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              // Draw minimal detection box (no default ugly boxes — we draw ourselves)
              const ctx = canvasRef.current.getContext('2d');
              if (ctx && resizedDetections.detection) {
                const box = resizedDetections.detection.box;
                const pad = 12;
                const bracketSize = 18;
                ctx.strokeStyle = hesitationFlag ? '#f43f5e' : '#22d3ee';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 8;
                ctx.shadowColor = hesitationFlag ? '#f43f5e' : '#22d3ee';
                // top-left
                ctx.beginPath(); ctx.moveTo(box.x - pad, box.y - pad + bracketSize); ctx.lineTo(box.x - pad, box.y - pad); ctx.lineTo(box.x - pad + bracketSize, box.y - pad); ctx.stroke();
                // top-right
                ctx.beginPath(); ctx.moveTo(box.x + box.width + pad - bracketSize, box.y - pad); ctx.lineTo(box.x + box.width + pad, box.y - pad); ctx.lineTo(box.x + box.width + pad, box.y - pad + bracketSize); ctx.stroke();
                // bottom-left
                ctx.beginPath(); ctx.moveTo(box.x - pad, box.y + box.height + pad - bracketSize); ctx.lineTo(box.x - pad, box.y + box.height + pad); ctx.lineTo(box.x - pad + bracketSize, box.y + box.height + pad); ctx.stroke();
                // bottom-right
                ctx.beginPath(); ctx.moveTo(box.x + box.width + pad - bracketSize, box.y + box.height + pad); ctx.lineTo(box.x + box.width + pad, box.y + box.height + pad); ctx.lineTo(box.x + box.width + pad, box.y + box.height + pad - bracketSize); ctx.stroke();
              }
            }

            const expr = detections.expressions;
            if (expr.surprised > 0.4 || expr.sad > 0.4 || expr.disgusted > 0.4) {
              setHesitationFlag(true);
            } else {
              setHesitationFlag(false);
            }
          } else {
            setFaceDetected(false);
            setScanStep('scanning');
            setExpressions(null);
            setHesitationFlag(false);
            if (canvasRef.current) {
              canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
        }
      }, 500);
    }

    return () => {
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    };
  }, [isScanning, modelsLoaded, hesitationFlag]);

  const handleRestart = () => {
    setScanStep('initializing');
    setIsScanning(true);
    setFaceDetected(false);
    setHesitationFlag(false);
    setExpressions(null);
  };

  const dominantExpression = expressions
    ? Object.keys(expressions).reduce((a, b) =>
        (expressions as any)[a] > (expressions as any)[b] ? a : b
      )
    : null;

  // Status config
  const statusConfig = hesitationFlag
    ? { label: 'Hesitation Detected', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-400' }
    : faceDetected
    ? { label: 'Face Locked', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' }
    : !modelsLoaded
    ? { label: 'Loading Models…', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' }
    : { label: 'Scanning…', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-400' };

  return (
    <div className="bg-[#080c14] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl">

      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full animate-pulse ${statusConfig.dot}`} />
          <span className="text-sm font-semibold text-slate-200 tracking-tight">
            Visual Intelligence Interface
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScanning(v => !v)}
            className={`px-3 py-1 rounded-md text-xs font-mono border transition-all ${
              isScanning
                ? 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {isScanning ? 'Pause' : 'Paused'}
          </button>
          <button
            onClick={handleRestart}
            className="px-3 py-1 rounded-md text-xs font-mono bg-white/5 border border-white/10 text-slate-300 hover:border-white/20 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="relative w-full aspect-video bg-[#030608] overflow-hidden">

        {/* Webcam Feed */}
        {isScanning ? (
          <Webcam
            ref={webcamRef}
            muted
            className="w-full h-full object-cover opacity-85"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-600 font-mono text-sm tracking-widest">PAUSED</span>
          </div>
        )}

        {/* Face detection canvas overlay */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

        {/* Static scan-line overlay (subtle CRT feel) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #fff 2px, #fff 3px)',
            backgroundSize: '100% 4px',
          }}
        />

        {/* Animated scan beam (vertical, slow, smooth) */}
        {isScanning && (
          <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ animation: 'scanBeam 3s ease-in-out infinite' }}>
            <div
              className="h-16 w-full"
              style={{
                background: hesitationFlag
                  ? 'linear-gradient(to bottom, transparent, rgba(244,63,94,0.06) 40%, rgba(244,63,94,0.12) 50%, rgba(244,63,94,0.06) 60%, transparent)'
                  : 'linear-gradient(to bottom, transparent, rgba(34,211,238,0.04) 40%, rgba(34,211,238,0.10) 50%, rgba(34,211,238,0.04) 60%, transparent)',
              }}
            />
          </div>
        )}

        {/* Static corner brackets — always visible frame guide */}
        {isScanning && (
          <>
            {/* Top-left */}
            <div className={`absolute top-6 left-6 w-8 h-8 pointer-events-none transition-colors duration-700 ${faceDetected ? (hesitationFlag ? 'text-rose-400' : 'text-emerald-400') : 'text-cyan-400/50'}`}>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 16 L0 0 L16 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Top-right */}
            <div className={`absolute top-6 right-6 w-8 h-8 pointer-events-none transition-colors duration-700 ${faceDetected ? (hesitationFlag ? 'text-rose-400' : 'text-emerald-400') : 'text-cyan-400/50'}`}>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 0 L32 0 L32 16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Bottom-left */}
            <div className={`absolute bottom-12 left-6 w-8 h-8 pointer-events-none transition-colors duration-700 ${faceDetected ? (hesitationFlag ? 'text-rose-400' : 'text-emerald-400') : 'text-cyan-400/50'}`}>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 16 L0 32 L16 32" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Bottom-right */}
            <div className={`absolute bottom-12 right-6 w-8 h-8 pointer-events-none transition-colors duration-700 ${faceDetected ? (hesitationFlag ? 'text-rose-400' : 'text-emerald-400') : 'text-cyan-400/50'}`}>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 32 L32 32 L32 16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </>
        )}

        {/* State badge (top-right corner of viewport) */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-medium backdrop-blur-sm transition-all duration-500 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${!faceDetected && modelsLoaded ? 'animate-pulse' : ''}`} />
            {statusConfig.label}
          </div>
        </div>

        {/* Status Strip (bottom) */}
        <div className="absolute bottom-0 inset-x-0 z-10 px-4 py-2.5 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-mono">
            {hesitationFlag ? (
              <span className="flex items-center gap-1.5 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Cognitive hesitation pattern detected
              </span>
            ) : faceDetected ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <UserCheck className="w-3.5 h-3.5" />
                Subject acquired
                {dominantExpression && (
                  <span className="text-slate-400 ml-1">· <span className="text-slate-200 capitalize">{dominantExpression}</span></span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Scan className="w-3.5 h-3.5 animate-pulse" />
                {modelsLoaded ? 'Searching field of view…' : 'Initializing AI models…'}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-600 tracking-widest">HESI-NET · v1</span>
        </div>
      </div>

    </div>
  );
};
