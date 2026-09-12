'use client';

import { useState, useEffect } from 'react';
import { X, Coffee, Flame, Heart, Compass, Sparkles, Check, ArrowRight } from 'lucide-react';

export type CarePackageType = 'tea' | 'candle' | 'hug' | 'grounding';

interface CarePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareToChat: (message: string) => void;
  companionName: string;
}

const PACKAGES: { id: CarePackageType; title: string; subtitle: string; icon: any; emoji: string }[] = [
  { id: 'tea',       title: 'Warm Herbal Tea',      subtitle: 'A soothing cup of chamomile & steam', icon: Coffee,  emoji: '☕' },
  { id: 'candle',    title: 'Tranquil Candle',      subtitle: 'Flickering flame & steady focus',    icon: Flame,   emoji: '🕯️' },
  { id: 'hug',       title: 'Heartfelt Hug',        subtitle: 'Warm comfort & gentle reassurance',  icon: Heart,   emoji: '🫂' },
  { id: 'grounding', title: '5-4-3-2-1 Grounding',  subtitle: 'Sensory awareness anxiety reset',    icon: Compass, emoji: '🌿' },
];

const GROUNDING_STEPS = [
  { num: 5, sense: 'Sight',       icon: '👁️', prompt: 'Look around. Notice 5 things you can see (the shape of a shadow, a color, a texture).' },
  { num: 4, sense: 'Touch',       icon: '✋', prompt: 'Notice 4 things you can physically feel (the chair beneath you, your clothes, your feet on the floor).' },
  { num: 3, sense: 'Hearing',     icon: '👂', prompt: 'Close your eyes for a moment. Listen for 3 distinct sounds nearby or in the distance.' },
  { num: 2, sense: 'Smell',       icon: '👃', prompt: 'Notice 2 things you can smell, or recall your favorite calming scent (rain, coffee, pine).' },
  { num: 1, sense: 'Taste/Grace', icon: '👅', prompt: 'Notice 1 taste in your mouth, or name 1 small thing you are genuinely thankful for today.' },
];

export default function CarePackageModal({
  isOpen,
  onClose,
  onShareToChat,
  companionName,
}: CarePackageModalProps) {
  const [activeTab, setActiveTab] = useState<CarePackageType>('tea');
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [groundingIndex, setGroundingIndex] = useState<number>(0);

  // Reset state on open or tab change
  useEffect(() => {
    if (activeTab === 'tea') {
      setTimerSeconds(30);
      setTimerRunning(false);
    } else if (activeTab === 'candle') {
      setTimerSeconds(60);
      setTimerRunning(false);
    } else if (activeTab === 'grounding') {
      setGroundingIndex(0);
    }
  }, [activeTab, isOpen]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(10px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          borderRadius: 'var(--radius-xl)',
          padding: '26px 28px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 45px var(--accent-glow)',
          border: '1px solid var(--glass-border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎁</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px', margin: 0 }}>
                Comfort Care Packages
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Micro-moments of calm and sensory grounding crafted for you
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {PACKAGES.map(p => {
            const isActive = activeTab === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`care-tab-btn ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 6px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--accent-glow)' : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? '1px solid var(--accent-soft)' : '1px solid var(--glass-border)',
                  color: isActive ? 'var(--accent-soft)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '18px' }}>{p.emoji}</span>
                <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 500, textAlign: 'center' }}>
                  {p.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '16px 12px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--glass-border)',
            minHeight: '260px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 1. Herbal Tea */}
          {activeTab === 'tea' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '380px' }}>
              <div className="tea-cup-container">
                <div className="tea-steam-wrap">
                  <span className="tea-steam steam-1" />
                  <span className="tea-steam steam-2" />
                  <span className="tea-steam steam-3" />
                </div>
                <div className="tea-cup">
                  ☕
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  A Fresh Cup of Chamomile & Honey
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Wrap your hands around the warmth. Inhale the sweet floral scent. Release the tension in your jaw and neck.
                </p>
              </div>

              {/* Timer control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-soft)' }}>
                  00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                </span>
                <button
                  className="mode-pill active"
                  onClick={() => setTimerRunning(r => !r)}
                  style={{ fontSize: '12px', padding: '6px 16px' }}
                >
                  {timerRunning ? 'Pause Sip' : timerSeconds === 0 ? 'Brew Again' : 'Begin 30s Sip'}
                </button>
              </div>
            </div>
          )}

          {/* 2. Meditative Candle */}
          {activeTab === 'candle' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '380px' }}>
              <div className="candle-container">
                <div className="candle-glow" />
                <div className="candle-flame" />
                <div className="candle-body" />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  The Gentle Flame of Quiet
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Watch the calm dance of the flame. Let all external demands fade for just sixty seconds. You are safe here.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', color: '#f7c873' }}>
                  00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                </span>
                <button
                  className="mode-pill active"
                  onClick={() => setTimerRunning(r => !r)}
                  style={{ fontSize: '12px', padding: '6px 16px' }}
                >
                  {timerRunning ? 'Pause Meditation' : timerSeconds === 0 ? 'Relight' : 'Focus for 60s'}
                </button>
              </div>
            </div>
          )}

          {/* 3. Virtual Hug */}
          {activeTab === 'hug' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '380px' }}>
              <div className="hug-pulse-container">
                <div className="hug-wave wave-1" />
                <div className="hug-wave wave-2" />
                <div className="hug-core">
                  <Heart size={34} color="white" fill="white" />
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  A Warm, Unconditional Hug
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Take a deep breath and let someone else hold space for you. You don't have to carry the whole world on your own.
                </p>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 16px',
                  fontSize: '12px',
                  color: 'var(--accent-soft)',
                  fontStyle: 'italic',
                }}
              >
                "You are worthy of rest, kindness, and patience."
              </div>
            </div>
          )}

          {/* 4. 5-4-3-2-1 Grounding */}
          {activeTab === 'grounding' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '420px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '28px' }}>{GROUNDING_STEPS[groundingIndex].icon}</span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--accent-soft)',
                  background: 'var(--accent-glow)',
                  padding: '2px 10px',
                  borderRadius: '12px',
                }}>
                  Step {groundingIndex + 1} of 5: {GROUNDING_STEPS[groundingIndex].sense}
                </span>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, minHeight: '52px', display: 'flex', alignItems: 'center' }}>
                {GROUNDING_STEPS[groundingIndex].prompt}
              </p>

              {/* Step indicator pills */}
              <div style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
                {GROUNDING_STEPS.map((s, idx) => (
                  <div
                    key={s.num}
                    style={{
                      width: '28px',
                      height: '6px',
                      borderRadius: '3px',
                      background: idx <= groundingIndex ? 'var(--accent-soft)' : 'rgba(255, 255, 255, 0.1)',
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {groundingIndex < GROUNDING_STEPS.length - 1 ? (
                  <button
                    className="mode-pill active"
                    onClick={() => setGroundingIndex(i => i + 1)}
                    style={{ fontSize: '12px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Next Sense <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    className="mode-pill active"
                    onClick={() => setGroundingIndex(0)}
                    style={{ fontSize: '12px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Check size={13} /> Grounding Complete! Repeat?
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid var(--glass-border)',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Want {companionName}'s thoughts on this moment?
          </span>
          <button
            onClick={() => {
              let shareText = '';
              if (activeTab === 'tea') shareText = `I just took a quiet 30-second break with a warm herbal tea ☕. Tell me a gentle comforting thought.`;
              else if (activeTab === 'candle') shareText = `I just meditated by the tranquil candle flame 🕯️. It felt grounding.`;
              else if (activeTab === 'hug') shareText = `I needed a warm hug today 🫂. Thank you for being here with me.`;
              else if (activeTab === 'grounding') shareText = `I just completed the 5-4-3-2-1 sensory grounding exercise 🌿.`;
              onShareToChat(shareText);
              onClose();
            }}
            className="mode-pill active"
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={13} /> Share with {companionName}
          </button>
        </div>
      </div>
    </div>
  );
}
