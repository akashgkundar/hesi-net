import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, AlertCircle, CheckCircle2, Cpu } from 'lucide-react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { HesiNetService } from '../services/hesiNetService';
import { HesiNetBackendService } from '../services/hesiNetBackendService';
import type { HesiNetServerPrediction } from '../services/hesiNetBackendService';

export const FaceScannerAnimation: React.FC = () => {
  const [_scanStep, setScanStep] = useState<'idle' | 'initializing' | 'scanning' | 'locked'>('initializing');
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isHesitating, setIsHesitating] = useState(false);

  // 10-Model Ensemble Backend State
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [_ensemblePrediction, setEnsemblePrediction] = useState<HesiNetServerPrediction | null>(null);
  const frameBufferRef = useRef<Blob[]>([]);
  const isPredictingRef = useRef<boolean>(false);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectIntervalRef = useRef<number | null>(null);

  // Ping HESI-NET Backend Server
  useEffect(() => {
    let mounted = true;
    const checkServer = async () => {
      const health = await HesiNetBackendService.checkHealth();
      if (mounted) {
        setBackendOnline(!!health && health.ok);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

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

  // Face Detection & Frame Capture Loop
  useEffect(() => {
    if (isScanning && modelsLoaded && webcamRef.current?.video) {
      detectIntervalRef.current = window.setInterval(async () => {
        const video = webcamRef.current?.video;
        if (video && video.readyState === 4) {
          const detections = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          // Capture frame for 10-model backend ensemble
          if (backendOnline && !isPredictingRef.current && canvasRef.current) {
            const hiddenCanvas = document.createElement('canvas');
            hiddenCanvas.width = 256;
            hiddenCanvas.height = 256;
            const hCtx = hiddenCanvas.getContext('2d');
            if (hCtx) {
              hCtx.drawImage(video, 0, 0, 256, 256);
              hiddenCanvas.toBlob(async (blob) => {
                if (blob) {
                  frameBufferRef.current.push(blob);
                  if (frameBufferRef.current.length >= 16) {
                    isPredictingRef.current = true;
                    const framesToSend = [...frameBufferRef.current];
                    frameBufferRef.current = [];
                    const pred = await HesiNetService.pushVideoFrames(framesToSend);
                    if (pred) {
                      setEnsemblePrediction(pred);
                      setHasEvaluated(true);
                      setIsHesitating(pred.probability >= 0.5);
                    }
                    isPredictingRef.current = false;
                  }
                }
              }, 'image/jpeg', 0.85);
            }
          }

          if (detections) {
            setFaceDetected(true);
            setScanStep('locked');
            HesiNetService.pushDetections(detections.expressions);

            if (canvasRef.current) {
              const displaySize = { width: video.videoWidth, height: video.videoHeight };
              faceapi.matchDimensions(canvasRef.current, displaySize);
              const resizedDetections = faceapi.resizeResults(detections, displaySize);
              canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              
              const ctx = canvasRef.current.getContext('2d');
              if (ctx && resizedDetections.detection) {
                const box = resizedDetections.detection.box;
                const pad = 12;
                const bracketSize = 18;
                const color = isHesitating ? '#f43f5e' : '#10b981';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.shadowBlur = 8;
                ctx.shadowColor = color;
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

            // Client-side detection evaluation when backend offline
            if (!backendOnline) {
              const expr = detections.expressions;
              const hesitatingSignal = expr.surprised > 0.35 || expr.sad > 0.35 || expr.fearful > 0.35;
              setHasEvaluated(true);
              setIsHesitating(hesitatingSignal);
            }
          } else {
            setFaceDetected(false);
            setScanStep('scanning');
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
  }, [isScanning, modelsLoaded, isHesitating, backendOnline]);

  const handleRestart = () => {
    setScanStep('initializing');
    setIsScanning(true);
    setFaceDetected(false);
    setHasEvaluated(false);
    setIsHesitating(false);
    setEnsemblePrediction(null);
    frameBufferRef.current = [];
  };

  // Only two prediction states: "hesitation detected" or "hesitation not detected"
  const predictionStatus = hasEvaluated
    ? isHesitating
      ? { label: 'Hesitation Detected', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-400' }
      : { label: 'Hesitation Not Detected', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' }
    : !modelsLoaded
    ? { label: 'Loading Models…', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' }
    : { label: 'Scanning…', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-400' };

  return (
    <div className="bg-[#080c14] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl">

      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full animate-pulse ${predictionStatus.dot}`} />
          <span className="text-sm font-semibold text-slate-200 tracking-tight">
            Visual Intelligence Interface
          </span>
          {backendOnline ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> 10-Model Ensemble Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Cpu className="w-3 h-3" /> Real-Time Vision Active
            </span>
          )}
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
        {/* Background Grid Accent */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* The Live Video Feed */}
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          screenshotFormat="image/jpeg"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay Canvas for face bounding boxes */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Ambient scanning laser bar */}
        {isScanning && !faceDetected && (
          <div className="absolute inset-x-0 top-0 pointer-events-none animate-scanline">
            <div
              className="h-16 w-full"
              style={{
                background: isHesitating
                  ? 'linear-gradient(to bottom, transparent, rgba(244,63,94,0.06) 40%, rgba(244,63,94,0.12) 50%, rgba(244,63,94,0.06) 60%, transparent)'
                  : 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.04) 40%, rgba(16,185,129,0.10) 50%, rgba(16,185,129,0.04) 60%, transparent)',
              }}
            />
          </div>
        )}

        {/* Corner brackets — frame guide */}
        {isScanning && (
          <>
            {/* Top-left */}
            <div className={`absolute top-6 left-6 w-8 h-8 pointer-events-none transition-colors duration-700 ${faceDetected ? (isHesitating ? 'text-rose-400' : 'text-emerald-400') : 'text-cyan-400/50'}`}>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 16 L0 0 L16 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Top-right */}
            <div className={`absolute top-6 right-6 w-8 h-8 pointer-events-none transition-colors duration-700 ${faceDetected ? (isHesitating ? 'text-rose-400' : 'text-emerald-400') : 'text-cyan-400/50'}`}>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 0 L32 0 L32 16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Bottom-left */}
            <div className={`absolute bottom-12 left-6 w-8 h-8 pointer-events-none transition-colors duration-700 ${faceDetected ? (isHesitating ? 'text-rose-400' : 'text-emerald-400') : 'text-cyan-400/50'}`}>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 16 L0 32 L16 32" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Bottom-right */}
            <div className={`absolute bottom-12 right-6 w-8 h-8 pointer-events-none transition-colors duration-700 ${faceDetected ? (isHesitating ? 'text-rose-400' : 'text-emerald-400') : 'text-cyan-400/50'}`}>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 32 L32 32 L32 16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </>
        )}

        {/* State badge (top-right corner of viewport) */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-semibold backdrop-blur-md shadow-lg transition-all duration-500 ${predictionStatus.bg} ${predictionStatus.border} ${predictionStatus.color}`}>
            <span className={`w-2 h-2 rounded-full ${predictionStatus.dot} ${hasEvaluated ? 'animate-pulse' : ''}`} />
            {predictionStatus.label}
          </div>
        </div>

        {/* Status Strip (bottom) */}
        <div className="absolute bottom-0 inset-x-0 z-10 px-4 py-2.5 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-mono">
            {hasEvaluated ? (
              isHesitating ? (
                <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Hesitation Detected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Hesitation Not Detected
                </span>
              )
            ) : (
              <span className="text-slate-400">Position face within frame to analyze...</span>
            )}
          </div>

          {/* Simple Clean Prediction Indicator */}
          {hasEvaluated && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Prediction:</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                isHesitating
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              }`}>
                {isHesitating ? 'HESITATION DETECTED' : 'HESITATION NOT DETECTED'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
