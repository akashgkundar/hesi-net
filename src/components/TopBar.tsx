import React from 'react';
import { Activity, Home, BarChart2, Info, HelpCircle } from 'lucide-react';
import type { TabType } from '../App';

interface TopBarProps {
  activeTab:    TabType;
  setActiveTab: (tab: TabType) => void;
}

const PAGE_META: Record<TabType, { title: string; subtitle: string; icon: React.ElementType }> = {
  'home':         { title: 'Dashboard',           subtitle: 'Overview of your hesitation intelligence',    icon: Home       },
  'analysis':     { title: 'Hesitation Analysis',  subtitle: 'Real-time detection via camera & microphone', icon: Activity   },
  'how-it-works': { title: 'Progress',             subtitle: 'Your sessions and growth trends',            icon: BarChart2  },
  'about':        { title: 'About',                subtitle: 'How HESINET works and our methodology',      icon: Info       },
  'mira':         { title: 'MIRA AI Assistant',    subtitle: 'Your AI companion for moving forward',       icon: HelpCircle },
  'settings':     { title: 'Settings',             subtitle: 'Account, privacy and preferences',           icon: HelpCircle },
  'history':      { title: 'Session History',      subtitle: 'Past analyses and trends over time',         icon: BarChart2  },
  'help':         { title: 'About & Help',         subtitle: 'Documentation and support',                  icon: HelpCircle },
};

export const TopBar: React.FC<TopBarProps> = ({ activeTab }) => {
  const meta = PAGE_META[activeTab] ?? PAGE_META['home'];
  const Icon = meta.icon;

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface-raised)',
        flexShrink: 0,
      }}
      role="banner"
    >
      {/* Left: page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: 'var(--color-primary-dim)',
            border: '1px solid rgba(59,130,246,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={15} style={{ color: 'var(--color-primary-hover)' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {meta.title}
          </h1>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: status pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div
          className="badge badge-primary"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          <div className="badge-dot" />
          System Ready
        </div>
      </div>
    </header>
  );
};
