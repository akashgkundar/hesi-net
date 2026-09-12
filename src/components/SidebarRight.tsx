import React, { useState } from 'react';
import { Send, Paperclip, Bot } from 'lucide-react';

interface Message {
  id: number;
  role: 'bot' | 'user';
  text: string;
  time: string;
  chips?: string[];
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'bot',
    time: '10:24 AM',
    text: "Hi! I noticed from your recent analysis that you might be feeling some hesitation. That's completely normal — it just means you care and want to do things well.\n\nYou're not stuck. You're just at a crossroads, and I'm here to help you move forward, step by step.\n\nWould you like to talk about what's holding you back, or would you prefer some quick motivation and tips first?",
    chips: ["Talk about what's holding me back", "Give me motivation & tips", "Show me next steps"],
  },
  {
    id: 2,
    role: 'user',
    time: '10:26 AM',
    text: "Give me motivation & tips",
  },
  {
    id: 3,
    role: 'bot',
    time: '10:25 AM',
    text: "You've already taken the most important step — you're here, and that shows strength! 💪\n\nHere are a few things to keep in mind:\n1. Break it down – Big goals feel easier when you split them into small steps.\n2. Focus on progress, not perfection – Every little effort counts.\n3. Be kind to yourself – it's okay to feel unsure sometimes. You're still moving forward, and that matters.\n\nWould you like me to create a simple step-by-step plan for your goal, or would you prefer to chat more about what's on your mind?",
    chips: ["Create a step-by-step plan", "Chat more"],
  },
];

export const SidebarRight: React.FC = () => {
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleSend = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: trimmed,
    }]);
    setInputVal('');
  };

  const handleChip = (chip: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: chip,
    }]);
  };

  return (
    <aside
      className="fixed right-0 top-0 h-screen flex flex-col z-50"
      style={{
        width: '320px',
        background: 'linear-gradient(180deg, #0A0D1F 0%, #080B1A 100%)',
        borderLeft: '1px solid rgba(99,102,241,0.1)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-4 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(34,211,238,0.2))',
                border: '1.5px solid rgba(99,102,241,0.4)',
                boxShadow: '0 0 12px rgba(99,102,241,0.2)',
              }}
            >
              <Bot className="w-5 h-5 text-indigo-300" />
            </div>
            {/* Online dot */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
              style={{
                background: '#10b981',
                borderColor: '#0A0D1F',
                boxShadow: '0 0 6px rgba(16,185,129,0.7)',
              }}
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white leading-none">MIRA <span className="font-normal text-xs text-indigo-300">(AI Assistant)</span></h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Your AI Companion</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-400">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === 'bot' ? (
              <div className="flex gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: 'rgba(99,102,241,0.2)',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div
                    className="p-3 rounded-2xl rounded-tl-sm text-[11px] leading-relaxed text-slate-300"
                    style={{
                      background: 'rgba(15,21,53,0.8)',
                      border: '1px solid rgba(99,102,241,0.1)',
                    }}
                  >
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                    <span className="block text-[9px] text-slate-600 mt-1.5 text-right">{msg.time}</span>
                  </div>
                  {/* Action chips */}
                  {msg.chips && (
                    <div className="flex flex-col gap-1.5 pl-0">
                      {msg.chips.map((chip) => (
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
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.5)';
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.15)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.2)';
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.08)';
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
              <div className="flex justify-end">
                <div
                  className="max-w-[80%] p-3 rounded-2xl rounded-tr-sm text-[11px] leading-relaxed text-white"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: '0 0 12px rgba(99,102,241,0.3)',
                  }}
                >
                  {msg.text}
                  <span className="block text-[9px] text-indigo-200 mt-1 text-right">{msg.time}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="px-3 pb-4 pt-2 shrink-0" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
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
            type="text"
            placeholder="Type a message..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent border-none focus:outline-none text-[11px] text-slate-300 placeholder-slate-600"
          />
          <button
            onClick={handleSend}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 0 8px rgba(99,102,241,0.4)',
            }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
