import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Activity, Send, Bot, Loader2, Paperclip, Heart, Navigation } from 'lucide-react';
import type { TabType } from '../App';

// ── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
  chips?: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;

const CANDIDATE_MODELS = [
  'minimax/minimax-m3:free',
  'liquid/lfm-2.5-2.6b:free',
  'google/gemma-4-26b-a4b-it:free',
];

const MIRA_SYSTEM_PROMPT = `IMPORTANT: Reply directly and naturally. Do NOT output any internal thinking, analysis steps, or reasoning.

You are MIRA (Motivational Intelligent Responsive Assistant) — the AI companion for HESINET, a Visual Decision Hesitation Detection system. You are warm, encouraging and insightful.

Your purpose:
- Understand the user's thoughts and feelings
- Guide them with simple, actionable next steps
- Support their growth journey
- Help turn their hesitation into decisive action

Personality:
- Warm, encouraging and empathetic like a trusted mentor
- Clear and concise — no rambling
- Genuine — not robotic, not sycophantic
- Use markdown for emphasis (**bold**), bullet points, and line breaks

Safety: Never claim to be a therapist. For crisis situations, gently guide to professional help (988 or local helplines).`;

// Landscape backgrounds with quotes for the left panel
const LANDSCAPES = [
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    quote: "You're not alone.\nLet's move forward.",
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    quote: "Every step forward\nis a step toward strength.",
  },
  {
    url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80',
    quote: "The summit begins\nwith a single step.",
  },
  {
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80',
    quote: "Clarity comes to those\nwho keep moving.",
  },
  {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
    quote: "In stillness, we find\nour true direction.",
  },
];

const INITIAL_CHIPS = [
  "Talk about what's holding me back",
  'Give me motivation & tips',
  'Show me next steps',
];

interface MiraPageProps {
  setActiveTab: (tab: TabType) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const MiraPage: React.FC<MiraPageProps> = ({ setActiveTab }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I noticed from your recent analysis that you might be feeling some hesitation. That's completely normal — it just means you care and want to do things well.\n\nYou're not stuck. You're just at a crossroads, and I'm here to help you move forward, step by step.\n\nWould you like to talk about what's holding you back, or would you prefer some quick motivation and tips first?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chips: INITIAL_CHIPS,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [landscapeIdx, setLandscapeIdx] = useState(0);
  const [landscapeFading, setLandscapeFading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate landscape every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLandscapeFading(true);
      setTimeout(() => {
        setLandscapeIdx(prev => (prev + 1) % LANDSCAPES.length);
        setLandscapeFading(false);
      }, 600);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (customMessage?: string) => {
    const text = (customMessage ?? input).trim();
    if (!text || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: 'user', content: text, time: timeStr };
    const history = [...messages, userMsg];

    setMessages(history);
    setInput('');
    setLoading(true);

    const botIdx = history.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '', time: timeStr }]);

    const apiMessages = [
      { role: 'system', content: MIRA_SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role, content: m.content })),
    ];

    let succeeded = false;

    for (const model of CANDIDATE_MODELS) {
      try {
        if (!OPENROUTER_API_KEY) throw new Error('NO_API_KEY');

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'X-Title': 'HESINET MIRA AI',
            'HTTP-Referer': window.location.origin,
          },
          body: JSON.stringify({
            model,
            messages: apiMessages,
            stream: true,
            max_tokens: 600,
            temperature: 0.8,
          }),
        });

        if (!res.ok || !res.body) continue;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.startsWith('data: ') && !l.includes('[DONE]'));
          for (const line of lines) {
            try {
              const json = JSON.parse(line.replace('data: ', ''));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                setMessages(prev => {
                  const next = [...prev];
                  next[botIdx] = { role: 'assistant', content: accumulated, time: timeStr };
                  return next;
                });
              }
            } catch {
              /* skip bad lines */
            }
          }
        }
        succeeded = true;
        break;
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'NO_API_KEY') {
          setMessages(prev => {
            const next = [...prev];
            next[botIdx] = {
              role: 'assistant',
              content: "I'm MIRA, your AI guide from HESINET! To enable live responses, please add `VITE_OPENROUTER_API_KEY` to your `.env` file. 😊",
              time: timeStr,
            };
            return next;
          });
          succeeded = true;
          break;
        }
        console.warn(`MIRA: model ${model} failed, trying next…`, err);
      }
    }

    if (!succeeded) {
      setMessages(prev => {
        const next = [...prev];
        next[botIdx] = {
          role: 'assistant',
          content: "I'm having a little trouble connecting right now. Could you try again in a moment? I'm right here with you. 💙",
          time: timeStr,
        };
        return next;
      });
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleChip = (chip: string) => handleSend(chip);

  // Simple markdown renderer (bold + newlines)
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-indigo-300 font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part.split('\n').map((line, j, arr) => (
        <React.Fragment key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  const landscape = LANDSCAPES[landscapeIdx];

  return (
    <div
      className="fixed inset-0 z-20 flex overflow-hidden"
      style={{ left: '224px', right: '320px' }}
    >
      {/* ── LEFT PANEL: Landscape hero + MIRA branding ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Landscape image with fade transition */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url('${landscape.url}')`,
            opacity: landscapeFading ? 0 : 0.55,
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-10">
          {/* HESINET branding */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.4)',
                boxShadow: '0 0 15px rgba(99,102,241,0.2)',
              }}
            >
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-widest text-white font-mono">HESINET</div>
              <div className="text-[9px] text-indigo-400/70 font-mono">Visual Decision Hesitation Detection</div>
            </div>
          </div>

          {/* MEET MIRA + tagline */}
          <div className="space-y-8 max-w-lg">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.3em] text-cyan-300/60 mb-2 uppercase">Meet</p>
              <h1
                className="text-8xl font-black tracking-tight leading-none mb-3"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #c084fc 50%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.5))',
                }}
              >
                MIRA
              </h1>
              <p className="text-2xl text-slate-300 font-light tracking-wide mb-4">Your AI Guide</p>
              <p className="text-lg font-medium italic" style={{ color: 'rgba(167,139,250,0.85)' }}>
                Turn hesitation<br />into action.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-5">
              {[
                { icon: Camera, label: 'Understands', desc: 'your thoughts & feelings', color: 'text-cyan-400', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)' },
                { icon: Navigation, label: 'Guides', desc: 'with simple next steps', color: 'text-purple-400', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
                { icon: Heart, label: 'Supports', desc: 'your growth journey', color: 'text-pink-400', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-default">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ background: item.bg, border: `1px solid ${item.border}` }}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Handwriting + slogan + rotating quote */}
          <div className="flex items-end justify-between">
            {/* Signature */}
            <div>
              <div
                className="text-3xl text-cyan-200/80 mb-4 -rotate-2"
                style={{
                  fontFamily: "'Caveat', cursive, 'Brush Script MT'",
                  textShadow: '0 0 15px rgba(34,211,238,0.3)',
                }}
              >
                Hi, I'm MIRA.<br />Let's move forward.
              </div>
              <div>
                <p className="text-[10px] tracking-[0.3em] font-bold text-slate-600 uppercase">Same you.</p>
                <p className="text-[10px] tracking-[0.3em] font-bold text-purple-400 uppercase">Stronger</p>
                <p className="text-[10px] tracking-[0.3em] font-bold text-purple-400 uppercase">Tomorrow.</p>
                <div
                  className="w-10 h-0.5 mt-2"
                  style={{
                    background: 'linear-gradient(to right, #22d3ee, #818cf8)',
                    boxShadow: '0 0 8px rgba(34,211,238,0.5)',
                  }}
                />
              </div>
            </div>

            {/* Rotating landscape quote bottom-right */}
            <div
              className="text-right pb-2 pr-4"
              style={{
                opacity: landscapeFading ? 0 : 1,
                transition: 'opacity 0.7s',
              }}
            >
              <p
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: '20px',
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: '1.5',
                  transform: 'rotate(-4deg)',
                  display: 'inline-block',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
              >
                {landscape.quote.split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Status + Chat ── */}
      <div
        className="w-96 flex flex-col gap-4 p-6 relative z-10"
        style={{ background: 'rgba(7,9,26,0.65)', backdropFilter: 'blur(12px)' }}
      >
        {/* Status indicators */}
        <div
          className="p-4 rounded-2xl space-y-3"
          style={{
            background: 'rgba(10,13,31,0.8)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          {[
            { icon: Camera, label: 'Camera', status: 'Connected', color: 'text-cyan-400', statusColor: 'text-emerald-400', dot: 'bg-emerald-400', pulse: true },
            { icon: Mic, label: 'Microphone', status: 'Connected', color: 'text-purple-400', statusColor: 'text-emerald-400', dot: 'bg-emerald-400', pulse: true },
            { icon: Activity, label: 'Analysis', status: 'Ready', color: 'text-blue-400', statusColor: 'text-blue-400', dot: 'bg-blue-400', pulse: false },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab('analysis')}
              className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">{item.label}</p>
                <p className={`text-xs font-semibold ${item.statusColor} flex items-center gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dot} ${item.pulse ? 'animate-pulse' : ''}`} />
                  {item.status}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Chat container */}
        <div
          className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-0"
          style={{
            background: 'rgba(10,13,31,0.9)',
            border: '1px solid rgba(99,102,241,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Chat header */}
          <div
            className="px-4 py-3 flex items-center justify-between shrink-0"
            style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(34,211,238,0.2))',
                    border: '1.5px solid rgba(99,102,241,0.4)',
                    boxShadow: '0 0 12px rgba(99,102,241,0.25)',
                  }}
                >
                  <Bot className="w-5 h-5 text-indigo-300" />
                </div>
                {/* Online dot */}
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 animate-pulse"
                  style={{ background: '#10b981', borderColor: '#0a0d1f', boxShadow: '0 0 6px rgba(16,185,129,0.7)' }}
                />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white leading-none">
                  MIRA <span className="text-indigo-300 font-normal text-xs">(AI Assistant)</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Your AI Companion</p>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-400">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 py-4 space-y-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}
          >
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'assistant' ? (
                  <div className="flex gap-2.5">
                    {/* Bot mini-avatar */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      {/* Bubble */}
                      <div
                        className="p-3 rounded-2xl rounded-tl-sm text-[11px] leading-relaxed text-slate-300"
                        style={{
                          background: 'rgba(15,21,53,0.8)',
                          border: '1px solid rgba(99,102,241,0.1)',
                        }}
                      >
                        {msg.content ? (
                          renderText(msg.content)
                        ) : loading && i === messages.length - 1 ? (
                          <div className="flex gap-1 items-center py-1">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                          </div>
                        ) : null}
                        {msg.time && (
                          <span className="block text-[9px] text-slate-600 mt-1.5 text-right">{msg.time}</span>
                        )}
                      </div>

                      {/* Action chips */}
                      {msg.chips && !loading && (
                        <div className="flex flex-col gap-1.5">
                          {msg.chips.map(chip => (
                            <button
                              key={chip}
                              onClick={() => handleChip(chip)}
                              className="text-left text-[10px] px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]"
                              style={{
                                background: 'rgba(99,102,241,0.08)',
                                border: '1px solid rgba(99,102,241,0.2)',
                                color: '#818cf8',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)';
                                (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)';
                                (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)';
                              }}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* User message */
                  <div className="flex justify-end">
                    <div
                      className="max-w-[80%] p-3 rounded-2xl rounded-tr-sm text-[11px] leading-relaxed text-white"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        boxShadow: '0 0 12px rgba(99,102,241,0.3)',
                      }}
                    >
                      {msg.content}
                      {msg.time && (
                        <span className="block text-[9px] text-indigo-200 mt-1 text-right">{msg.time}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            className="px-3 pb-4 pt-2 shrink-0"
            style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}
          >
            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
              style={{
                background: 'rgba(15,21,53,0.8)',
                border: '1px solid rgba(99,102,241,0.15)',
              }}
            >
              <button className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none outline-none text-[11px] text-slate-300 placeholder-slate-600"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  boxShadow: '0 0 8px rgba(99,102,241,0.4)',
                }}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
