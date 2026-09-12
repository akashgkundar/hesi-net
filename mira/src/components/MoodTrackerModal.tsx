'use client';

import { useState, useEffect } from 'react';
import { X, Heart, Calendar, TrendingUp } from 'lucide-react';

export interface MoodEntry {
  id: string;
  timestamp: number;
  dateStr: string;
  emoji: string;
  label: string;
  score: number; // 1-7
  note?: string;
}

const MOODS = [
  { emoji: '😊', label: 'Great',       score: 7, color: '#48a97c' },
  { emoji: '🙂', label: 'Good',        score: 6, color: '#5eb296' },
  { emoji: '😐', label: 'Okay',        score: 5, color: '#689bb5' },
  { emoji: '😴', label: 'Tired',       score: 4, color: '#c49e68' },
  { emoji: '😟', label: 'Stressed',    score: 3, color: '#c88062' },
  { emoji: '😔', label: 'Low',         score: 2, color: '#bf6c74' },
  { emoji: '😣', label: 'Overwhelmed', score: 1, color: '#a8535a' },
];

interface MoodTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodSelected?: (moodLabel: string) => void;
}

export default function MoodTrackerModal({ isOpen, onClose, onMoodSelected }: MoodTrackerModalProps) {
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('calmchat_mood_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectMood = (mood: typeof MOODS[0]) => {
    setSelectedMood(mood.label);
    const now = new Date();
    const newEntry: MoodEntry = {
      id: `${Date.now()}`,
      timestamp: Date.now(),
      dateStr: now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      emoji: mood.emoji,
      label: mood.label,
      score: mood.score,
    };

    const updated = [newEntry, ...history.slice(0, 19)]; // Keep last 20 entries
    setHistory(updated);
    try {
      localStorage.setItem('calmchat_mood_history', JSON.stringify(updated));
      localStorage.setItem('calmchat_current_mood', mood.label);
    } catch {}

    if (onMoodSelected) {
      onMoodSelected(mood.label);
    }
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
        maxWidth: '480px',
        width: '100%',
        borderRadius: 'var(--radius-xl)',
        padding: '26px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Heart size={18} color="var(--accent-soft)" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            How are you feeling right now?
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px' }}>
          Checking in helps CalmChat adapt its tone and provides a private record of your wellness over time.
        </p>

        {/* Mood Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))',
          gap: '8px',
          marginBottom: '28px',
        }}>
          {MOODS.map((m) => (
            <button
              key={m.label}
              onClick={() => handleSelectMood(m)}
              className="chip"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 6px',
                gap: '6px',
                borderColor: selectedMood === m.label ? 'var(--accent)' : 'var(--glass-border)',
                background: selectedMood === m.label ? 'var(--accent-glow)' : undefined,
              }}
            >
              <span style={{ fontSize: '26px' }}>{m.emoji}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Recent History / Trend */}
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Recent Check-ins
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {history.length} logged
            </span>
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              No entries logged yet. Tap an emotion above to record your first check-in!
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {history.slice(0, 7).map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    minWidth: '68px',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '20px', marginBottom: '2px' }}>{entry.emoji}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.label}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {entry.dateStr.split(',')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
