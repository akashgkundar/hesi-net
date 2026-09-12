'use client';

import { useState } from 'react';
import { X, Sparkles, Plus, Trash2, ShieldCheck, Heart, Bookmark } from 'lucide-react';

export interface MemoryItem {
  id: string;
  category: 'preference' | 'life' | 'goal' | 'comfort';
  fact: string;
  createdAt: string;
}

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  onAddMemory: (category: MemoryItem['category'], fact: string) => void;
  onRemoveMemory: (id: string) => void;
  onClearAll: () => void;
  companionName: string;
}

const CATEGORIES: { id: MemoryItem['category']; label: string; icon: string }[] = [
  { id: 'comfort',    label: 'Comforts & Joy',  icon: '☕' },
  { id: 'life',       label: 'Life & People',   icon: '🌿' },
  { id: 'goal',       label: 'Goals & Focus',   icon: '🎯' },
  { id: 'preference', label: 'Chat Style',      icon: '💬' },
];

export default function MemoryModal({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onRemoveMemory,
  onClearAll,
  companionName,
}: MemoryModalProps) {
  const [newFact, setNewFact] = useState('');
  const [category, setCategory] = useState<MemoryItem['category']>('comfort');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    onAddMemory(category, newFact.trim());
    setNewFact('');
  };

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
          maxWidth: '540px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px var(--accent-glow)',
          border: '1px solid var(--glass-border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px var(--accent-glow)',
              }}
            >
              <Bookmark size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px', margin: 0 }}>
                Companion Memory Capsule
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                What {companionName} remembers to keep your chats warm and familiar
              </p>
            </div>
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

        {/* Info banner */}
        <div
          style={{
            background: 'var(--accent-glow)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--accent-soft)',
          }}
        >
          <ShieldCheck size={16} style={{ flexShrink: 0 }} />
          <span>Stored locally on your device. {companionName} uses these to remember your preferences organically.</span>
        </div>

        {/* Add Memory Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`mode-pill ${category === c.id ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="chat-input"
              value={newFact}
              onChange={e => setNewFact(e.target.value)}
              placeholder='e.g., "I love green tea", "I have a puppy named Leo", "Preparing for an interview"'
              style={{ flex: 1, fontSize: '13px', padding: '10px 14px' }}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!newFact.trim()}
              title="Add memory"
              style={{ width: '42px', height: '42px', flexShrink: 0, borderRadius: 'var(--radius-md)' }}
            >
              <Plus size={18} />
            </button>
          </div>
        </form>

        {/* Memories list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '4px',
            minHeight: '160px',
            maxHeight: '320px',
          }}
        >
          {memories.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)' }}>
              <Sparkles size={28} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
              <div style={{ fontSize: '13px', fontWeight: 500 }}>No memories saved yet</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                Add little details about your day, comforts, or goals above!
              </div>
            </div>
          ) : (
            memories.map(m => {
              const catObj = CATEGORIES.find(c => c.id === m.category);
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--bot-bubble-border)',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '14px' }}>{catObj?.icon || '💭'}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                      {m.fact}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveMemory(m.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px',
                      transition: 'color 0.2s',
                    }}
                    title="Forget this memory"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {memories.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid var(--glass-border)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            <span>{memories.length} item{memories.length > 1 ? 's' : ''} in memory</span>
            <button
              onClick={() => {
                if (confirm('Clear all memories?')) {
                  onClearAll();
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#e06c75',
                cursor: 'pointer',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Trash2 size={12} /> Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
