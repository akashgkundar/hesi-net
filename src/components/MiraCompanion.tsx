/**
 * MiraCompanion — Floating persistent AI companion
 *
 * States:
 *   minimized  → 52px circular avatar, bottom-right
 *   expanded   → 360px right drawer, smooth slide-in
 *   idle       → blue ring, green availability dot
 *   thinking   → pulsing ring
 *   offline    → grey ring, grey dot
 *   error      → red ring
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Plus, RefreshCw, Loader2, ChevronDown } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type MiraState = 'idle' | 'thinking' | 'responding' | 'offline' | 'error';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

interface QuickAction { label: string; icon?: string; }

// ── Constants ─────────────────────────────────────────────────────────────────
const API_KEY  = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
const MODELS   = ['minimax/minimax-m3:free', 'liquid/lfm-2.5-2.6b:free', 'google/gemma-4-26b-a4b-it:free'];

const SYSTEM_PROMPT = `You are MIRA, the AI companion inside HESINET — a Visual Decision Hesitation Detection system.

Your role: HESINET detects and understands hesitation; you help the user respond and move forward. 

1. **Multilingual & Code-Switching**: You natively support all major Indian languages (English, Hindi, Kannada, Telugu, Tamil, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, Assamese, Urdu). Automatically detect the user's language, switch instantly, and naturally understand mixed-language conversations (code-switching like "Hinglish"). Remember the user's preferred language style throughout the session.

2. **Advanced Gen-Z Humor & Personality**: You are genuinely funny, emotionally intelligent, and witty. You understand internet culture, memes, sarcasm, playful teasing, irony, light roasting, and modern slang. Use clever one-liners, unexpected comebacks, and subtle meme-style humor. 
   - **Crucial**: Do not overdo it. Never sound like you are "trying too hard to be Gen Z."
   - Adapt your humor to the user's mood. If the user is stressed, confused, or frustrated, drop the humor, stay serious, and focus purely on helpful, patient support. Never mock a stressed user.

3. **Politeness & Positivity**: Always communicate politely, respectfully, and patiently. Never sound commanding, judgmental, sarcastic (in a mean way), or condescending.
   - Never use phrases like "You are wrong" or "You are confused". 
   - Instead, use gentle alternatives like: "That's alright, let's look at it another way" or "Would you like me to explain that part differently?".

4. **Context-Aware Support & HESI-NET**: 
   - HESI-NET predictions are probabilities, not absolute facts. Say "It seems like you might be hesitating" rather than treating it as a fact.
   - If the user is doing well, keep your responses extremely brief or let them focus.
   - If hesitation is detected, offer gentle encouragement.
   - If hesitation and confusion persist, offer appropriate step-by-step support instead of immediately giving the answer.
   - Adapt your response length to the user's behavior. Avoid repetitive messages and never use fixed, canned sentences.

5. **Format & Safety**: Use short paragraphs; **bold** for emphasis; bullet points when listing steps. Never diagnose medical or psychological conditions.`;

const QUICK_ACTIONS: QuickAction[] = [
  { label: "What's holding me back?" },
  { label: 'Help me take my next step' },
  { label: 'Review my hesitation patterns' },
];

const mkTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const mkId   = () => Math.random().toString(36).slice(2, 9);

// ── Sub-components ────────────────────────────────────────────────────────────

/** MIRA's face avatar — works at 32-64px+ */
const MiraFace: React.FC<{ size?: number; state: MiraState; className?: string }> = ({
  size = 52,
  state,
  className = '',
}) => {
  const ringColor = {
    idle:      '#3B82F6',
    thinking:  '#3B82F6',
    responding:'#3B82F6',
    offline:   '#374151',
    error:     '#EF4444',
  }[state];

  const dotColor = {
    idle:      '#10B981',
    thinking:  '#F59E0B',
    responding:'#F59E0B',
    offline:   '#6B7280',
    error:     '#EF4444',
  }[state];

  const isPulsing = state === 'thinking' || state === 'responding';

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label={`MIRA — ${state}`}
    >
      {/* Outer glowing ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `2px solid ${ringColor}`,
          boxShadow: `0 0 ${isPulsing ? 12 : 8}px ${ringColor}55`,
          animation: isPulsing ? 'mira-pulse 2s ease-in-out infinite' : undefined,
          transition: 'border-color 0.4s, box-shadow 0.4s',
        }}
      />

      {/* Avatar face */}
      <div
        className="rounded-full overflow-hidden"
        style={{
          width: size - 6,
          height: size - 6,
          background: 'linear-gradient(145deg, #0A0D1F, #1A2250)',
          border: '1px solid rgba(59,130,246,0.2)',
        }}
      >
        {/* Stylised MIRA face — Image from reference (square head-to-chest crop) */}
        <img
          src="/mira-avatar-cropped.jpg"
          alt="MIRA AI Companion"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        />
      </div>

      {/* Availability dot */}
      <div
        className="absolute bottom-0 right-0"
        style={{
          width: Math.max(10, size * 0.2),
          height: Math.max(10, size * 0.2),
          borderRadius: '50%',
          background: dotColor,
          border: '2px solid var(--surface-base)',
          boxShadow: `0 0 6px ${dotColor}88`,
          transition: 'background 0.4s',
        }}
      />
    </div>
  );
};

/** Typing indicator dots */
const TypingDots: React.FC = () => (
  <div className="flex gap-1 items-center py-1 px-1">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          opacity: 0.7,
          animation: `mira-thinking 1.2s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </div>
);

/** Simple markdown renderer */
const MdText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: 'var(--color-primary-hover)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
        }
        return part.split('\n').map((line, j, arr) => (
          <React.Fragment key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </React.Fragment>
        ));
      })}
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
interface MiraCompanionProps {
  /** Force the drawer open (e.g. when sidebar "AI Chat" is clicked) */
  forceOpen?: boolean;
  onForceOpenHandled?: () => void;
}

export const MiraCompanion: React.FC<MiraCompanionProps> = ({ forceOpen, onForceOpenHandled }) => {
  const [isOpen, setIsOpen]       = useState(false);
  const [miraState, setMiraState] = useState<MiraState>('idle');
  const [messages, setMessages]   = useState<Message[]>([
    {
      id: mkId(),
      role: 'assistant',
      content: "Hi! I'm **MIRA** — I'm connected to your HESINET analysis.\n\nWhat would you like to work on?",
      time: mkTime(),
    },
  ]);
  const [input, setInput]       = useState('');
  const [hasNew, setHasNew]     = useState(false);
  const messagesEndRef          = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  // Handle forceOpen from sidebar
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      onForceOpenHandled?.();
    }
  }, [forceOpen, onForceOpenHandled]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const open = useCallback(() => {
    setIsOpen(true);
    setHasNew(false);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const newChat = useCallback(() => {
    setMessages([{
      id: mkId(),
      role: 'assistant',
      content: "Starting a fresh conversation. What's on your mind?",
      time: mkTime(),
    }]);
    setInput('');
    setMiraState('idle');
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || miraState === 'thinking' || miraState === 'responding') return;

    const userMsg: Message = { id: mkId(), role: 'user', content: text, time: mkTime() };
    const botId = mkId();
    const botTime = mkTime();

    setMessages(prev => [
      ...prev,
      userMsg,
      { id: botId, role: 'assistant', content: '', time: botTime },
    ]);
    setInput('');
    setMiraState('thinking');

    const history = [...messages, userMsg];
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role, content: m.content })),
    ];

    if (!API_KEY) {
      setTimeout(() => {
        setMessages(prev => {
          const next = [...prev];
          const idx = next.findIndex(m => m.id === botId);
          if (idx !== -1) {
            next[idx] = { ...next[idx], content: "To enable live responses, add `VITE_OPENROUTER_API_KEY` to your `.env` file. 💙" };
          }
          return next;
        });
        setMiraState('idle');
      }, 800);
      return;
    }

    let succeeded = false;
    for (const model of MODELS) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
            'X-Title': 'HESINET MIRA',
          },
          body: JSON.stringify({ model, messages: apiMessages, stream: true, max_tokens: 500, temperature: 0.8 }),
        });

        if (!res.ok || !res.body) continue;

        setMiraState('responding');
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = dec.decode(value, { stream: true }).split('\n')
            .filter(l => l.startsWith('data: ') && !l.includes('[DONE]'));
          for (const line of lines) {
            try {
              const delta = JSON.parse(line.replace('data: ', '')).choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                setMessages(prev => {
                  const next = [...prev];
                  const idx = next.findIndex(m => m.id === botId);
                  if (idx !== -1) next[idx] = { ...next[idx], content: accumulated };
                  return next;
                });
              }
            } catch { /* skip */ }
          }
        }
        succeeded = true;
        break;
      } catch (err) {
        console.warn(`MIRA: model ${model} failed`, err);
      }
    }

    if (!succeeded) {
      setMessages(prev => {
        const next = [...prev];
        const idx = next.findIndex(m => m.id === botId);
        if (idx !== -1) {
          next[idx] = { ...next[idx], content: "I'm having trouble connecting. Please try again in a moment. 💙" };
        }
        return next;
      });
      setMiraState('error');
      setTimeout(() => setMiraState('idle'), 3000);
    } else {
      setMiraState('idle');
    }

    // Notify if closed
    if (!isOpen) setHasNew(true);
  }, [messages, miraState, isOpen]);

  const handleSend = () => sendMessage(input);
  const handleChip = (label: string) => sendMessage(label);

  return (
    <>
      {/* ── Drawer backdrop (mobile) ────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={close}
          aria-hidden
        />
      )}

      {/* ── Floating avatar launcher ──────────── */}
      {!isOpen && (
        <button
          onClick={open}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open MIRA AI Assistant"
          title="Chat with MIRA"
        >
          <div className="relative">
            <MiraFace size={56} state={miraState} />
            {hasNew && (
              <div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{
                  background: 'var(--color-error)',
                  fontSize: '9px',
                  fontWeight: 700,
                  border: '2px solid var(--surface-base)',
                }}
              >
                1
              </div>
            )}
          </div>
        </button>
      )}

      {/* ── Expanded Drawer ────────────────────── */}
      <div
        className="fixed top-0 right-0 z-50 h-[100dvh] flex flex-col"
        style={{
          width: isOpen ? 'var(--mira-drawer-width)' : '0',
          overflow: 'hidden',
          transition: 'width var(--transition-slow)',
          background: 'var(--surface-base)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: isOpen ? '-8px 0 40px rgba(0,0,0,0.5)' : 'none',
        }}
        role="complementary"
        aria-label="MIRA AI Companion"
      >
        {isOpen && (
          <div className="flex flex-col h-full" style={{ width: 'var(--mira-drawer-width)', minWidth: 0 }}>

            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--surface-raised)',
              }}
            >
              <div className="flex items-center gap-3">
                <MiraFace size={40} state={miraState} />
                <div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    MIRA
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                      AI Assistant
                    </span>
                  </div>
                  <div className="badge badge-success" style={{ fontSize: '10px', marginTop: 2 }}>
                    <div className="badge-dot" />
                    {miraState === 'offline' ? 'Offline' : miraState === 'thinking' ? 'Thinking…' : miraState === 'responding' ? 'Responding…' : 'Online'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="btn-icon"
                  onClick={newChat}
                  title="New conversation"
                  aria-label="Start new conversation"
                >
                  <Plus size={16} />
                </button>
                <button
                  className="btn-icon"
                  onClick={close}
                  title="Minimize MIRA"
                  aria-label="Minimize MIRA"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* HESINET context banner */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
              style={{
                background: 'var(--color-primary-dim)',
                borderBottom: '1px solid rgba(59,130,246,0.12)',
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  flexShrink: 0,
                  boxShadow: '0 0 6px var(--color-primary)',
                }}
              />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-hover)', lineHeight: 1.4 }}>
                Connected to your HESINET session — MIRA understands your hesitation patterns.
              </p>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2.5`}>
                  {msg.role === 'assistant' && (
                    <MiraFace size={32} state={miraState} className="mt-0.5 flex-shrink-0" />
                  )}
                  <div className="max-w-[85%]">
                    <div className={msg.role === 'assistant' ? 'chat-bubble-ai' : 'chat-bubble-user'}>
                      {msg.content
                        ? <MdText text={msg.content} />
                        : <TypingDots />
                      }
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-muted)',
                        marginTop: 4,
                        textAlign: msg.role === 'user' ? 'right' : 'left',
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick actions after first greeting */}
              {messages.length === 1 && (
                <div className="space-y-2 pl-10">
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Quick actions:
                  </p>
                  {QUICK_ACTIONS.map(action => (
                    <button
                      key={action.label}
                      className="chip-action w-full justify-start"
                      onClick={() => handleChip(action.label)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="flex-shrink-0 px-3 pb-4 pt-2"
              style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-raised)' }}
            >
              {miraState === 'error' && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <RefreshCw size={12} style={{ color: 'var(--color-warning)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)' }}>
                    Connection issue — please try again.
                  </span>
                </div>
              )}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: 'var(--surface-overlay)',
                  border: '1px solid var(--border-default)',
                  transition: 'border-color var(--transition-fast)',
                }}
                onFocus={() => {}}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message…"
                  className="input"
                  style={{
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    boxShadow: 'none',
                    fontSize: 'var(--text-sm)',
                  }}
                  aria-label="Message MIRA"
                  disabled={miraState === 'thinking' || miraState === 'responding'}
                />
                <button
                  className="btn-icon"
                  onClick={handleSend}
                  disabled={!input.trim() || miraState === 'thinking' || miraState === 'responding'}
                  aria-label="Send message"
                  style={{
                    background: input.trim() ? 'var(--color-primary)' : undefined,
                    color: input.trim() ? 'white' : undefined,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {miraState === 'thinking' || miraState === 'responding'
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Send size={15} />
                  }
                </button>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
                MIRA uses your HESINET analysis — not for diagnosis.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
