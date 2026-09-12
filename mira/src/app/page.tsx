'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Activity, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Add initial greeting message
  useEffect(() => {
    setMessages([
      { role: 'assistant', content: "Hey! I'm MIRA.\nI'm here to help you understand, feel better, and take the next step." }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const botIdx = newMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      // We send request to /api/chat which should stream the response back.
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages, 
          settings: { mode: 'Talk', companionName: 'MIRA', archetype: 'wise_mentor' } 
        }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const next = [...prev];
          next[botIdx] = { role: 'assistant', content: accumulated };
          return next;
        });
      }
    } catch (err) {
      setMessages(prev => {
        const next = [...prev];
        next[botIdx] = { role: 'assistant', content: "I'm sorry, I encountered an error connecting to my core systems." };
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex font-sans select-none">
      
      {/* Background Image - MIRA Avatar */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/mira-bg.jpg)',
          opacity: 0.6,
          backgroundPosition: 'top center'
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black via-black/40 to-black/80 mix-blend-multiply" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/90" />

      {/* Main Layout Container */}
      <div className="relative z-10 flex flex-col md:flex-row w-full h-screen p-6 md:p-12 gap-8">
        
        {/* LEFT PANEL: Branding & Features */}
        <div className="flex-1 flex flex-col justify-between max-w-xl">
          
          {/* Top: HESI-NET Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-cyan-400/30 flex items-center justify-center bg-cyan-900/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-cyan-400" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-slate-100">HESI-NET</h1>
              <p className="text-[10px] text-cyan-400/80 tracking-widest uppercase">Visual Decision Hesitation Detection</p>
            </div>
          </div>

          {/* Middle: Meet MIRA */}
          <div className="space-y-12">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] text-cyan-200/70 mb-2 uppercase">Meet</p>
              <h2 
                className="text-7xl font-black tracking-tight mb-2"
                style={{
                  background: 'linear-gradient(to right, #60a5fa, #c084fc, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))'
                }}
              >
                MIRA
              </h2>
              <p className="text-2xl text-slate-300 font-light tracking-wide mb-6">Your AI Guide</p>
              
              <p className="text-lg text-purple-300/80 italic font-medium tracking-wide">
                Turn hesitation<br/>into action.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              {[
                { icon: Camera, title: 'Understands', desc: 'your thoughts & feelings', color: 'text-cyan-400', border: 'border-cyan-400/30' },
                { icon: Send, title: 'Guides', desc: 'with simple next steps', color: 'text-purple-400', border: 'border-purple-400/30' },
                { icon: Activity, title: 'Supports', desc: 'your growth journey', color: 'text-pink-400', border: 'border-pink-400/30' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-full border ${item.border} flex items-center justify-center bg-black/40 backdrop-blur-sm group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Signature & Slogan */}
          <div className="space-y-8">
            <div 
              className="text-3xl text-cyan-200/90 -rotate-3"
              style={{ fontFamily: "'Caveat', cursive", textShadow: '0 0 10px rgba(34,211,238,0.3)' }}
            >
              Hi, I'm MIRA.<br/>Let's move forward.
            </div>
            
            <div className="pt-8 border-t border-white/10">
              <p className="text-[10px] tracking-[0.3em] font-bold text-slate-500">SAME YOU.</p>
              <p className="text-[10px] tracking-[0.3em] font-bold text-purple-400">STRONGER</p>
              <p className="text-[10px] tracking-[0.3em] font-bold text-purple-400">TOMORROW.</p>
              <div className="w-12 h-0.5 bg-cyan-400 mt-2 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Chat Interface & Status */}
        <div className="w-full max-w-sm flex flex-col justify-end pb-8">
          
          {/* Status Indicators */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6 space-y-4 shadow-2xl self-end w-48">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Camera</p>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Microphone</p>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Analysis</p>
                <p className="text-xs text-blue-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Ready
                </p>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[500px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-blue-400/30 bg-blue-900/40 flex items-center justify-center shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-300" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">MIRA</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                  </p>
                </div>
              </div>
              <div className="text-blue-400 flex gap-1">
                <div className="w-1 h-3 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-4 bg-blue-400/80 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-2 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-blue-600/80 text-white rounded-tr-sm border border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                        : 'bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700'
                    }`}
                  >
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props}/>,
                        strong: ({node, ...props}) => <strong className="text-blue-300" {...props}/>
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                    {loading && i === messages.length - 1 && msg.role === 'assistant' && !msg.content && (
                      <div className="flex gap-1 mt-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-white/5">
              <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-2 py-1 focus-within:border-blue-500/50 focus-within:bg-black/60 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Talk to MIRA..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 px-2 py-2 placeholder-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
