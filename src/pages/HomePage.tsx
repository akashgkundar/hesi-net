import React, { useState, useEffect } from 'react';
import { Camera, Mic, User, ArrowRight, Activity, TrendingUp, BarChart2, MessageSquare, Play } from 'lucide-react';
import type { TabType } from '../App';

interface HomePageProps {
  setActiveTab: (tab: TabType) => void;
}

// Rotating landscape slides
const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80',
    quote: "You're not alone.\nLet's move forward.",
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80',
    quote: 'Every step forward\nis a step toward strength.',
  },
  {
    url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1400&q=80',
    quote: 'The summit begins\nwith a single step.',
  },
  {
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1400&q=80',
    quote: 'Clarity comes to those\nwho keep moving.',
  },
  {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&q=80',
    quote: 'In stillness, we find\nour true direction.',
  },
];

// Workflow steps — NOT separate products, ONE workflow
const WORKFLOW_STEPS = [
  {
    step: '01',
    icon: Camera,
    title: 'Video Detection',
    desc: 'Camera reads your facial micro-expressions and body language in real time.',
    color: 'var(--color-primary)',
    dimColor: 'var(--color-primary-dim)',
  },
  {
    step: '02',
    icon: Mic,
    title: 'Audio Analysis',
    desc: 'Voice tone, speech patterns, and pauses reveal hesitation signals.',
    color: 'var(--color-secondary)',
    dimColor: 'var(--color-secondary-dim)',
  },
  {
    step: '03',
    icon: User,
    title: 'Behavior Mapping',
    desc: 'Combined signals are mapped to identify uncertainty and avoidance patterns.',
    color: '#22d3ee',
    dimColor: 'rgba(34,211,238,0.12)',
  },
  {
    step: '04',
    icon: MessageSquare,
    title: 'MIRA Guides You',
    desc: 'MIRA interprets the results and helps you respond and move forward.',
    color: 'var(--color-success)',
    dimColor: 'var(--color-success-dim)',
  },
];

const PROGRESS_BARS = [
  { label: 'Confidence',  val: 72, change: '+12%', color: 'var(--color-primary)' },
  { label: 'Focus',       val: 58, change: '+8%',  color: 'var(--color-secondary)' },
  { label: 'Consistency', val: 65, change: '+10%', color: 'var(--color-success)' },
  { label: 'Mindset',     val: 80, change: '+15%', color: '#22d3ee' },
];

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const [heroIdx,    setHeroIdx]    = useState(0);
  const [heroPrev,   setHeroPrev]   = useState(-1);

  // Rotate landscape every 10s with crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroPrev(heroIdx);
      setHeroIdx(prev => (prev + 1) % HERO_SLIDES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [heroIdx]);

  const slide = HERO_SLIDES[heroIdx];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          height: 260,
          background: 'var(--surface-overlay)',
        }}
      >
        {/* Previous slide (fading out) */}
        {heroPrev >= 0 && (
          <div
            key={heroPrev}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url('${HERO_SLIDES[heroPrev].url}')`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: 0,
              animation: 'fade-in 0.8s ease-out reverse both',
            }}
          />
        )}
        {/* Current slide */}
        <div
          key={heroIdx}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('${slide.url}')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.45,
            animation: 'fade-in 1s ease-out both',
          }}
        />
        {/* Left gradient — content area */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(7,9,26,0.97) 0%, rgba(7,9,26,0.85) 45%, rgba(7,9,26,0.15) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(0deg, rgba(7,9,26,0.85) 0%, transparent 50%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative', zIndex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 36px',
            maxWidth: 560,
          }}
        >
          <div
            className="badge badge-primary"
            style={{ fontSize: 'var(--text-xs)', marginBottom: 12, width: 'fit-content' }}
          >
            Hesitation Intelligence Platform
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              marginBottom: 12,
            }}
          >
            Turn Hesitation<br />
            into <span className="text-gradient-primary">Action</span>
          </h1>

          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 20, maxWidth: 420 }}>
            HESINET detects your hesitation signals through camera and audio,
            maps the patterns, then connects you with MIRA — your AI companion —
            to help you respond and move forward.
          </p>

          <button
            className="btn-primary"
            onClick={() => setActiveTab('analysis')}
            style={{ width: 'fit-content' }}
          >
            <Play size={15} />
            Begin Analysis
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Rotating quote — bottom-right */}
        <div
          key={`quote-${heroIdx}`}
          style={{
            position: 'absolute',
            bottom: 20, right: 28,
            textAlign: 'right',
            animation: 'fade-in 1s ease-out both',
          }}
        >
          <p
            style={{
              fontFamily: "'Georgia', serif",
              fontStyle: 'italic',
              fontSize: 15,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.5,
              transform: 'rotate(-2deg)',
              display: 'inline-block',
            }}
          >
            {slide.quote.split('\n').map((line, i, arr) => (
              <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
            ))}
          </p>
        </div>

        {/* Slide indicator dots */}
        <div
          style={{
            position: 'absolute', bottom: 14, left: 36,
            display: 'flex', gap: 6,
          }}
        >
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setHeroPrev(heroIdx); setHeroIdx(i); }}
              aria-label={`Landscape ${i + 1}`}
              style={{
                width: i === heroIdx ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === heroIdx ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                padding: 0,
              }}
            />
          ))}
        </div>
      </section>

      {/* ── How HESINET Works (4-step workflow) ─────────────────── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
            How It Works
          </h2>
          <button
            className="btn-ghost"
            onClick={() => setActiveTab('how-it-works')}
            style={{ fontSize: 'var(--text-xs)' }}
          >
            See full details <ArrowRight size={12} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <button
                key={step.step}
                className="surface-card animate-fade-in"
                onClick={() => setActiveTab('analysis')}
                style={{
                  padding: 18,
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  textAlign: 'left',
                  animationDelay: `${idx * 0.07}s`,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--surface-raised)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = step.color + '55';
                  el.style.transform = 'translateY(-2px)';
                  el.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${step.color}22`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--border-subtle)';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'var(--shadow-card)';
                }}
                aria-label={`${step.title} — Start Analysis`}
              >
                {/* Step number */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 36, height: 36,
                      borderRadius: 10,
                      background: step.dimColor,
                      border: `1px solid ${step.color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon size={17} style={{ color: step.color }} />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: step.color,
                      opacity: 0.6,
                    }}
                  >
                    {step.step}
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {step.desc}
                </p>

                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    marginTop: 14,
                    fontSize: 'var(--text-xs)',
                    color: step.color,
                    fontWeight: 600,
                  }}
                >
                  Start Analysis <ArrowRight size={11} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Bottom row: Latest result + Progress ─────────────── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {/* Latest session — empty state (no real data yet) */}
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Activity size={15} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Latest Analysis</h3>
          </div>

          {/* Empty state */}
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '28px 0', gap: 12, textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--color-primary-dim)',
                border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Activity size={22} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                No sessions yet
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: 220, lineHeight: 1.5 }}>
                Run your first hesitation analysis to see results here.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setActiveTab('analysis')}
              style={{ fontSize: 'var(--text-sm)', padding: '8px 18px' }}
            >
              <Play size={13} /> Start First Analysis
            </button>
          </div>
        </div>

        {/* Progress overview */}
        <div className="surface-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={15} style={{ color: 'var(--color-success)' }} />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Progress</h3>
            </div>
            <span className="badge badge-muted" style={{ fontSize: '10px' }}>Demo data</span>
          </div>

          {/* Donut + bars */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {/* Donut */}
            <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
              <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="45" cy="45" r="35" fill="none" stroke="var(--border-default)" strokeWidth="7" />
                <circle
                  cx="45" cy="45" r="35" fill="none"
                  stroke="url(#prog-grad)" strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 35 * 0.68} ${2 * Math.PI * 35}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="prog-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>68%</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>Overall</span>
              </div>
            </div>

            {/* Bars */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PROGRESS_BARS.map(bar => (
                <div key={bar.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{bar.label}</span>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: bar.color }}>{bar.change}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${bar.val}%`,
                        background: bar.color,
                        borderRadius: 2,
                        transition: 'width 1.2s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn-ghost"
            onClick={() => setActiveTab('how-it-works')}
            style={{ marginTop: 14, width: '100%', justifyContent: 'center', fontSize: 'var(--text-xs)' }}
          >
            View full progress <BarChart2 size={12} />
          </button>
        </div>
      </section>
    </div>
  );
};
