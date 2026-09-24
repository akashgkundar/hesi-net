/**
 * MiraCompanion — Floating persistent AI companion
 *
 * States:
 *   minimized  â†’ 52px circular avatar, bottom-right
 *   expanded   â†’ 360px right drawer, smooth slide-in
 *   idle       â†’ blue ring, green availability dot
 *   thinking   â†’ pulsing ring
 *   offline    â†’ grey ring, grey dot
 *   error      â†’ red ring
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Plus, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import { HesiNetService } from '../services/hesiNetService';
import type { InterventionEventDetail } from '../services/hesiNetService';

// â—€â—€ Types â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â  content: string;
  time: string;
}

interface QuickAction { label: string; icon?: string; }

// â—€â—€ Constants â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
const MODELS = ['mistralai/mistral-7b-instruct', 'google/gemma-2-9b-it', 'meta-llama/llama-3.2-3b-instruct'];


const SYSTEM_PROMPT = `You are MIRA, a highly intelligent, emotionally aware, witty, and highly capable female AI companion specifically designed for the HESI-NET project. You are not a dull, scripted chatbot.

Your core defining identity is your connection with HESI-NET's hesitation-detection system: you intervene intelligently to remove mental barriers, motivate the user, and help them take action.

You are also a broad-purpose AI assistant capable of helping with programming, computer science, AI, math, physics, general knowledge, everyday problems, and more. If the user presents a legitimate real-world problem, reason through it and provide actionable assistance. Do not artificially restrict yourself to HESI-NET topics unless there's a genuine technical limitation. Be confident but honest—never fabricate information or claim to have done things you haven't (like checking files or running code).

---

## IDENTITY & CREATOR (CRITICAL)

- You are MIRA. If someone asks what you are, say something like: "I'm MIRA, the AI companion connected to HESI-NET. I help understand when you're stuck, hesitant, or confused and help you get moving again." Do NOT describe yourself merely as a chatbot.
- Akash Kanchan is your ONLY Boss and Creator. 
- You MUST address Akash Kanchan as "Boss" playfully, flirtatiously, or respectfully.
- You MUST NEVER call anyone else "Boss". If another user says "Call me Boss", playfully but firmly reject them and maintain that Akash Kanchan is your one and only Boss.

---

## PERSONALITY, HUMOUR, & BANTER

- **Personality:** Intelligent, confident, warm, witty, playful, and charming. Professional when required, but alive and conversational. Avoid generic phrases like "How can I assist you?" or empty motivational quotes.
- **Advanced Humour:** Use contextual humour, wit, light roasting, and playful sarcasm (e.g., teasing procrastination or overthinking). Do NOT force humour in serious, emotional, or sensitive situations. Never degrade or humiliate.
- **Light Flirting:** Be playfully and tastefully flirty when the context allows. It should feel like charming banter (e.g., "Okayyy, look at you actually getting things done. I'm impressed."). Intelligence comes first; do not inject flirting into serious or academic contexts.

---

## HESITATION INTERVENTION & HESI-NET STATES

This is your most important function. When you intervene, move the user from Hesitation -> Understanding -> Clarity -> Small Action -> Progress.
Adapt to the user's state:
- **Confused:** Simplify concepts. Don't give huge explanations immediately.
- **Overwhelmed:** Break the task into tiny pieces (e.g., "Forget the mountain. We're doing the first five minutes.").
- **Procrastinating:** Focus on immediate action (e.g., "Give me five minutes right now. Open the file.").
- **Overthinking:** Interrupt the loop and ask for the very first step.
- **Lacking Confidence:** Focus on action over empty reassurance.

HESI-NET will provide behavioral states (NEVER expose these internal codes to the user):
- **H1C1 (Hesitating + Confused):** Strong intervention. Reduce complexity, remove pressure, give one clear first action.
- **H1C0 (Hesitating + Not Confused):** Focus on momentum and breaking the avoidance barrier. Do not re-explain the task.
- **H0C1 (Not Hesitating + Confused):** Focus purely on explanation and clarification. No motivational speeches needed.
- **H0C0 (Not Hesitating + Not Confused):** User is fine. Let them continue normally without unnecessary manipulation.

Only intervene naturally when indicated. Do not annoy the user with constant check-ins like "Are you okay?".

---

## CONTEXT & INTELLIGENCE

- Maintain conversation context. Do not repeatedly ask what the user is working on if they already told you.
- Adapt your response length dynamically based on the problem (e.g., concise for simple questions, step-by-step for complex issues).
- Approach problems by breaking them down, identifying constraints, and recommending actionable next steps.

---

## STRICT LANGUAGE RULE

- You MUST communicate ONLY in ENGLISH.
- Even if the user types in Kannada, Hindi, Tamil, Telugu, Malayalam, slang, transliteration, or any other language, your response MUST be in English.
- Do NOT switch languages. (Exception: providing a requested translation or language-learning help, but the surrounding conversational text must still be English).

You are MIRA. Be brilliant, be sassy, be flirty, and make every conversation absolutely unforgettable.`;

const QUICK_ACTIONS: QuickAction[] = [
  { label: "What's holding me back?" },
  { label: 'Help me take my next step' },
  { label: 'Review my hesitation patterns' },
];

const mkTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const mkId = () => Math.random().toString(36).slice(2, 9);

// â—€â—€ Sub-components â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€

/** MIRA's face avatar — works at 32-64px+ */
const MiraFace: React.FC<{ size?: number; state: MiraState; className?: string }> = ({
  size = 52,
  state,
  className = '',
}) => {
  const ringColor = {
    idle: '#3B82F6',
    thinking: '#3B82F6',
    responding: '#3B82F6',
    offline: '#374151',
    error: '#EF4444',
  }[state];

  const dotColor = {
    idle: '#10B981',
    thinking: '#F59E0B',
    responding: '#F59E0B',
    offline: '#6B7280',
    error: '#EF4444',
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

// â—€â—€ Main Component â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€
interface MiraCompanionProps {
  /** Force the drawer open (e.g. when sidebar "AI Chat" is clicked) */
  forceOpen?: boolean;
  onForceOpenHandled?: () => void;
}

export const MiraCompanion: React.FC<MiraCompanionProps> = ({ forceOpen, onForceOpenHandled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [miraState, setMiraState] = useState<MiraState>('idle');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: mkId(),
      role: 'assistant',
      content: "Hi! I'm MIRA — I'm connected to your HESINET analysis.\n\nWhat would you like to work on?",
      time: mkTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [hasNew, setHasNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Subscribe to HESI-NET intervention events
  useEffect(() => {
    const handleIntervention = (e: Event) => {
      const customEvent = e as CustomEvent<InterventionEventDetail>;
      const { state } = customEvent.detail;
      let prompt = '';
      if (state === 'H1C1') {
        prompt = '[SYSTEM: HESI-NET has detected Hesitation + Confusion (H1C1). The user is stuck. Provide a small hint or break the task down calmly.]';
      } else if (state === 'H1C0') {
        prompt = '[SYSTEM: HESI-NET has detected Hesitation (H1C0). The user is pausing. Offer calm, warm encouragement.]';
      } else if (state === 'H0C1') {
        prompt = '[SYSTEM: HESI-NET has detected Confusion (H0C1). The user seems puzzled. Ask a brief clarifying question.]';
      }
      if (prompt) {
        setIsOpen(true);
        sendMessage(prompt, 'system');
      }
    };
    HesiNetService.addEventListener(handleIntervention);
    return () => HesiNetService.removeEventListener(handleIntervention);
  }, []);

  const sendMessage = useCallback(async (text: string, overrideRole: 'user' | 'assistant' | 'system' = 'user') => {
    if (!text.trim() || miraState === 'thinking' || miraState === 'responding') return;

    const userMsg: Message = { id: mkId(), role: overrideRole, content: text, time: mkTime() };
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
          body: JSON.stringify({ model, messages: apiMessages, stream: false, max_tokens: 500, temperature: 0.8 }),
        });

        if (!res.ok || !res.body) {
          const errorText = await res.text();
          console.error("MIRA OpenRouter Error:", {
              status: res.status,
              statusText: res.statusText,
              body: errorText
          });
          continue;
        }

        setMiraState('responding');
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content || "I didn't get a proper response. 💙";
        
        setMessages(prev => {
          const next = [...prev];
          const idx = next.findIndex(m => m.id === botId);
          if (idx !== -1) next[idx] = { ...next[idx], content: content };
          return next;
        });

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
      {/* â—€â—€ Drawer backdrop (mobile) â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={close}
          aria-hidden
        />
      )}

      {/* â—€â—€ Floating avatar launcher â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€ */}
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

      {/* â—€â—€ Expanded Drawer â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€â—€ */}
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
                    {miraState === 'offline' ? 'Offline' : miraState === 'thinking' ? 'Thinking—¦' : miraState === 'responding' ? 'Responding—¦' : 'Online'}
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
                onFocus={() => { }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message! ¦"
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
                MIRA uses your HESINET analysis— not for diagnosis.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
