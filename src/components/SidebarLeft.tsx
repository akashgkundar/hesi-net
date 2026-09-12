import React, { useState } from 'react';
import {
  Home, Activity, BarChart2, MessageSquare, Settings,
  Brain, ChevronLeft, ChevronRight, X, History, Info,
} from 'lucide-react';
import type { TabType } from '../App';

interface SidebarLeftProps {
  activeTab:    TabType;
  setActiveTab: (tab: TabType) => void;
  mobileOpen:   boolean;
  onMobileClose: () => void;
}

type NavItem = {
  id:       TabType;
  label:    string;
  icon:     React.ElementType;
  group:    string;
  badge?:   string;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  // Main
  { id: 'home',         label: 'Dashboard',          icon: Home,         group: 'Main' },
  // Analysis
  { id: 'analysis',     label: 'Hesitation Analysis', icon: Activity,     group: 'Analysis' },
  // Insights
  { id: 'how-it-works', label: 'Progress',             icon: BarChart2,    group: 'Insights' },
  { id: 'history',      label: 'History',              icon: History,      group: 'Insights', badge: 'Soon' },
  // AI
  { id: 'mira',         label: 'MIRA Assistant',       icon: MessageSquare,group: 'AI' },
  // System
  { id: 'settings',     label: 'Settings',             icon: Settings,     group: 'System', badge: 'Soon' },
  { id: 'help',         label: 'About & Help',         icon: Info,         group: 'System', badge: 'Soon' },
] as const;

const GROUPS = ['Main', 'Analysis', 'Insights', 'AI', 'System'];

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  onMobileClose,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleNav = (item: NavItem) => {
    if (item.disabled) return;
    setActiveTab(item.id);
    onMobileClose();
  };

  const sidebar = (
    <aside
      style={{
        width:    collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
        height:   '100dvh',
        display:  'flex',
        flexDirection: 'column',
        background: 'var(--surface-raised)',
        borderRight: '1px solid var(--border-subtle)',
        transition: 'width var(--transition-slow)',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
      aria-label="Main navigation"
      role="navigation"
    >
      {/* Logo */}
      <div
        style={{
          padding: '16px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
          flexShrink: 0,
        }}
      >
        {/* Logo icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.15))',
              border: '1px solid rgba(59,130,246,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Brain size={18} style={{ color: 'var(--color-primary-hover)' }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{
                fontSize: 'var(--text-base)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '0.1em',
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: 'nowrap',
              }}>
                HESINET
              </div>
              <div style={{
                fontSize: '9px',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                Hesitation Intelligence
              </div>
            </div>
          )}
        </div>

        {/* Mobile close / Desktop collapse */}
        <button
          className="btn-icon"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
          style={{ flexShrink: 0, display: mobileOpen ? 'none' : undefined }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto py-3" style={{ paddingLeft: collapsed ? 8 : 12, paddingRight: collapsed ? 8 : 12 }}>
        {GROUPS.map(group => {
          const items = NAV_ITEMS.filter(item => item.group === group);
          return (
            <div key={group} style={{ marginBottom: 16 }}>
              {/* Group label */}
              {!collapsed && (
                <div style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                  padding: '0 10px',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                }}>
                  {group}
                </div>
              )}

              {items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isDisabled = item.disabled;

                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNav(item)}
                    disabled={isDisabled}
                    title={collapsed ? item.label : undefined}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      marginBottom: 2,
                      opacity: isDisabled ? 0.45 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      justifyContent: collapsed ? 'center' : undefined,
                      paddingLeft: isActive && !collapsed ? 8 : undefined,
                      gap: collapsed ? 0 : undefined,
                    }}
                  >
                    <div className="nav-icon" style={{ flexShrink: 0 }}>
                      <Icon size={14} />
                    </div>
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 999,
                              background: 'var(--color-neutral)',
                              color: 'var(--text-muted)',
                              flexShrink: 0,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom tagline */}
      {!collapsed && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          <p style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Detect · Understand · Move Forward
          </p>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0" style={{ height: '100dvh' }}>
        {sidebar}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={onMobileClose}
            aria-hidden
          />
          <div className="fixed left-0 top-0 z-50 h-[100dvh] md:hidden animate-slide-left w-[280px]">
            {/* Override close button for mobile */}
            <div style={{ position: 'relative' }}>
              {sidebar}
              <button
                className="btn-icon"
                onClick={onMobileClose}
                style={{ position: 'absolute', top: 14, right: 12 }}
                aria-label="Close navigation"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
