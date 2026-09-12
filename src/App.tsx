import React, { useState, useCallback, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { SidebarLeft } from './components/SidebarLeft';
import { TopBar }     from './components/TopBar';
import { MiraCompanion } from './components/MiraCompanion';

import { HomePage }       from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AnalysisPage }   from './pages/AnalysisPage';
import { AboutPage }      from './pages/AboutPage';

export type TabType =
  | 'home'
  | 'how-it-works'
  | 'analysis'
  | 'about'
  | 'mira'
  | 'settings'
  | 'history'
  | 'help';

const PAGE_TITLES: Record<TabType, string> = {
  'home':         'HESINET | Dashboard',
  'how-it-works': 'Progress | HESINET',
  'analysis':     'Hesitation Analysis | HESINET',
  'about':        'About | HESINET',
  'mira':         'MIRA AI Assistant | HESINET',
  'settings':     'Settings | HESINET',
  'history':      'History | HESINET',
  'help':         'Help | HESINET',
};

export const App: React.FC = () => {
  const [activeTab,        setActiveTabRaw]  = useState<TabType>('home');
  const [mobileNavOpen,    setMobileNavOpen] = useState(false);
  const [miraNeedOpen,     setMiraNeedOpen]  = useState(false);   // signal to MiraCompanion

  // Update document title on tab change
  useEffect(() => {
    document.title = PAGE_TITLES[activeTab] ?? 'HESINET';
  }, [activeTab]);

  // "mira" tab = open MIRA drawer, don't route to a page
  const setActiveTab = useCallback((tab: TabType) => {
    if (tab === 'mira') {
      setMiraNeedOpen(true);
      return;
    }
    setActiveTabRaw(tab);
    setMobileNavOpen(false);
  }, []);

  const handleMiraOpenHandled = useCallback(() => {
    setMiraNeedOpen(false);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        overflow: 'hidden',
        background: 'var(--surface-base)',
        color: 'var(--text-primary)',
        fontFamily: "'Inter', system-ui, sans-serif",
        maxWidth: 'var(--max-content-width)',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Ambient background — subtle, not overwhelming */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background:
            'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(59,130,246,0.05) 0%, transparent 60%),' +
            'radial-gradient(ellipse 50% 40% at 80% 100%, rgba(139,92,246,0.04) 0%, transparent 60%)',
        }}
      />

      {/* ── Sidebar ──────────────────────────────────────── */}
      <SidebarLeft
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      {/* ── Main content area ─────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          minWidth: 0,
        }}
      >
        {/* Mobile top bar — hamburger */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-raised)' }}
        >
          <button
            className="btn-icon"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
          <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>
            HESINET
          </span>
        </div>

        {/* Desktop top bar */}
        <div className="hidden md:block flex-shrink-0">
          <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px',
          }}
          id="main-content"
          role="main"
          tabIndex={-1}
        >
          {/* Render active page */}
          {activeTab === 'home'         && <HomePage       setActiveTab={setActiveTab} />}
          {activeTab === 'how-it-works' && <HowItWorksPage setActiveTab={setActiveTab} />}
          {activeTab === 'analysis'     && <AnalysisPage   setActiveTab={setActiveTab} />}
          {activeTab === 'about'        && <AboutPage       setActiveTab={setActiveTab} />}

          {/* Settings / Help / History — coming soon state */}
          {(activeTab === 'settings' || activeTab === 'help' || activeTab === 'history') && (
            <div
              className="animate-fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60vh',
                gap: 16,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'var(--color-primary-dim)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 28 }}>{activeTab === 'settings' ? '⚙️' : activeTab === 'history' ? '📊' : 'ℹ️'}</span>
              </div>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {activeTab === 'settings' ? 'Settings' : activeTab === 'history' ? 'Session History' : 'About & Help'}
                </h2>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.6 }}>
                  This section is under construction. It will include
                  {activeTab === 'settings'
                    ? ' account, appearance, camera, privacy, and data management options.'
                    : activeTab === 'history' 
                      ? ' past analysis sessions, export capabilities, and trend tracking over time.'
                      : ' documentation, FAQ, privacy policy, and version information.'}
                </p>
              </div>
              <span className="badge badge-muted" style={{ fontSize: 'var(--text-xs)' }}>Coming soon</span>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer
          className="hidden md:flex"
          style={{
            height: 40,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--surface-raised)',
          }}
        >
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            HESINET <span style={{ opacity: 0.5 }}>v2.0</span>
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Detect · Understand · Move Forward
          </span>
        </footer>
      </div>

      {/* ── MIRA floating companion (always present) ──── */}
      <MiraCompanion
        forceOpen={miraNeedOpen}
        onForceOpenHandled={handleMiraOpenHandled}
      />
    </div>
  );
};

export default App;
