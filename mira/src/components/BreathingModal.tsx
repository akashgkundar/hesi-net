'use client';

import { useState, useEffect } from 'react';
import { X, Wind, Eye, Hand, Ear, Sparkles, CheckCircle2 } from 'lucide-react';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'breathe' | 'ground';
type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export default function BreathingModal({ isOpen, onClose }: BreathingModalProps) {
  const [tab, setTab] = useState<Tab>('breathe');

  // Breathing Pacer State
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [timer, setTimer] = useState<number>(4);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [technique, setTechnique] = useState<'box' | 'calm'>('box'); // box: 4-4-4-4, calm: 4-7-8

  // Grounding 5-4-3-2-1 Steps
  const [groundStep, setGroundStep] = useState<number>(5);

  useEffect(() => {
    if (!isOpen || !isRunning || tab !== 'breathe') return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Advance phase
        if (technique === 'box') {
          if (phase === 'Inhale') { setPhase('Hold'); return 4; }
          if (phase === 'Hold') { setPhase('Exhale'); return 4; }
          if (phase === 'Exhale') { setPhase('Rest'); return 4; }
          if (phase === 'Rest') { setPhase('Inhale'); return 4; }
        } else {
          // 4-7-8 Calm Technique
          if (phase === 'Inhale') { setPhase('Hold'); return 7; }
          if (phase === 'Hold') { setPhase('Exhale'); return 8; }
          if (phase === 'Exhale') { setPhase('Inhale'); return 4; }
        }
        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning, phase, technique, tab]);

  if (!isOpen) return null;

  // Compute breathing scale for the animated circle
  const getCircleScale = () => {
    if (phase === 'Inhale') return 'scale(1.45)';
    if (phase === 'Hold') return 'scale(1.45)';
    if (phase === 'Exhale') return 'scale(0.85)';
    return 'scale(0.85)';
  };

  const getPhaseTransitionDuration = () => {
    if (phase === 'Inhale') return '4s';
    if (phase === 'Hold') return `${technique === 'box' ? 4 : 7}s`;
    if (phase === 'Exhale') return `${technique === 'box' ? 4 : 8}s`;
    return '4s';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px',
    }}>
      <div className="glass settings-panel" style={{
        maxWidth: '520px',
        width: '100%',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            className={`mode-pill ${tab === 'breathe' ? 'active' : ''}`}
            onClick={() => setTab('breathe')}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <Wind size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            Breathing Pacer
          </button>
          <button
            className={`mode-pill ${tab === 'ground' ? 'active' : ''}`}
            onClick={() => setTab('ground')}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <Sparkles size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            5-4-3-2-1 Grounding
          </button>
        </div>

        {tab === 'breathe' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Technique Switch */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              <button
                className="mode-pill"
                onClick={() => { setTechnique('box'); setPhase('Inhale'); setTimer(4); }}
                style={{
                  fontSize: '11px',
                  background: technique === 'box' ? 'var(--accent-glow)' : 'transparent',
                  borderColor: technique === 'box' ? 'var(--accent)' : 'var(--glass-border)',
                  color: technique === 'box' ? 'var(--accent-soft)' : 'var(--text-muted)',
                }}
              >
                Box Breathing (4-4-4-4)
              </button>
              <button
                className="mode-pill"
                onClick={() => { setTechnique('calm'); setPhase('Inhale'); setTimer(4); }}
                style={{
                  fontSize: '11px',
                  background: technique === 'calm' ? 'var(--accent-glow)' : 'transparent',
                  borderColor: technique === 'calm' ? 'var(--accent)' : 'var(--glass-border)',
                  color: technique === 'calm' ? 'var(--accent-soft)' : 'var(--text-muted)',
                }}
              >
                Deep Calm (4-7-8)
              </button>
            </div>

            {/* Glowing Orb Animation Container */}
            <div style={{
              width: '240px',
              height: '240px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
            }}>
              {/* Outer Pulsing Glow */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                  transform: getCircleScale(),
                  transition: `transform ${getPhaseTransitionDuration()} ease-in-out`,
                }}
              />

              {/* Main Breathing Circle */}
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-glow) 0%, var(--accent-2-glow) 100%)',
                  border: '2px solid var(--accent-soft)',
                  boxShadow: '0 0 35px var(--accent-glow)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: getCircleScale(),
                  transition: `transform ${getPhaseTransitionDuration()} ease-in-out`,
                }}
              >
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  {phase}
                </span>
                <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-soft)', marginTop: '2px' }}>
                  {timer}s
                </span>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="header-btn"
                onClick={() => setIsRunning(!isRunning)}
                style={{ padding: '8px 24px', fontSize: '13px' }}
              >
                {isRunning ? 'Pause' : 'Resume'}
              </button>
              <button
                className="header-btn"
                onClick={() => { setPhase('Inhale'); setTimer(4); }}
                style={{ padding: '8px 18px', fontSize: '13px', color: 'var(--text-muted)' }}
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          /* 5-4-3-2-1 Grounding Technique */
          <div style={{ width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              5-4-3-2-1 Sensory Grounding
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Bring your awareness back to your immediate environment step by step.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              marginBottom: '24px',
            }}>
              {groundStep === 5 && (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>👀</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-soft)', marginBottom: '6px' }}>
                    Look around: 5 Things you can SEE
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Notice a shadow, a pattern on the wall, the light from a lamp, an object on your desk.
                  </p>
                </div>
              )}
              {groundStep === 4 && (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✋</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-soft)', marginBottom: '6px' }}>
                    Feel: 4 Things you can TOUCH
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    The texture of your clothes, the smooth table surface, your feet firmly against the floor.
                  </p>
                </div>
              )}
              {groundStep === 3 && (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>👂</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-soft)', marginBottom: '6px' }}>
                    Listen: 3 Things you can HEAR
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    The hum of a fan, distant traffic, the sound of your own steady breathing.
                  </p>
                </div>
              )}
              {groundStep === 2 && (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>👃</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-soft)', marginBottom: '6px' }}>
                    Inhale: 2 Things you can SMELL
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Fresh air, coffee, your lotion, or simply take a deep breath through your nose.
                  </p>
                </div>
              )}
              {groundStep === 1 && (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>👅</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-soft)', marginBottom: '6px' }}>
                    Taste: 1 Thing you can TASTE
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    A sip of cool water, mint, or simply recognize the neutral taste in your mouth.
                  </p>
                </div>
              )}
              {groundStep === 0 && (
                <div>
                  <CheckCircle2 size={40} color="var(--accent-2)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Grounding Complete 🌿
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Notice how your feet are supported by the ground. You are safe in this present moment.
                  </p>
                </div>
              )}
            </div>

            {/* Step Navigation */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {groundStep > 0 ? (
                <button
                  className="header-btn"
                  onClick={() => setGroundStep(groundStep - 1)}
                  style={{ background: 'var(--accent-glow)', borderColor: 'rgba(124,106,247,0.4)', color: 'var(--accent-soft)', padding: '10px 24px' }}
                >
                  {groundStep === 1 ? 'Finish Grounding' : 'Next Step →'}
                </button>
              ) : (
                <button
                  className="header-btn"
                  onClick={() => setGroundStep(5)}
                  style={{ padding: '8px 20px' }}
                >
                  Start Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
