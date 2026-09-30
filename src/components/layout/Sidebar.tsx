'use client';

import { useUIStore } from '@/store/uiStore';
import { AppView, ROLE_PERMISSIONS, StaffMember } from '@/types';
import {
  LayoutDashboard, Calendar, Users, MessageCircle, Phone,
  FileText, Star, BarChart3, Zap, Settings, ChevronLeft, ChevronRight,
  Activity, ShieldAlert, LogOut, UserCircle, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface NavItem {
  view: AppView;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  module: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { view: 'super_admin',  label: 'Super Admin',       icon: <ShieldAlert size={18} />, module: 'super_admin' },
  { view: 'dashboard',    label: 'Dashboard',         icon: <LayoutDashboard size={18} />, module: 'dashboard' },
  { view: 'appointments', label: 'Appointments',      icon: <Calendar size={18} />, module: 'appointments' },
  { view: 'patients',     label: 'Patient Directory', icon: <Users size={18} />, module: 'patients' },
  { view: 'whatsapp',     label: 'WhatsApp AI',       icon: <MessageCircle size={18} />, module: 'whatsapp' },
  { view: 'voice-calls',  label: 'AI Voice Calls',    icon: <Phone size={18} />, module: 'voice-calls' },
  { view: 'reports',      label: 'Reports & Labs',    icon: <FileText size={18} />, module: 'reports' },
  { view: 'csat',         label: 'CSAT & Sentiment',  icon: <Star size={18} />, module: 'csat' },
  { view: 'analytics',    label: 'Analytics',         icon: <BarChart3 size={18} />, module: 'analytics' },
  { view: 'workflows',    label: 'Workflows',         icon: <Zap size={18} />, module: 'workflows' },
  { view: 'settings',     label: 'Settings',          icon: <Settings size={18} />, module: 'settings' },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin:      'Super Admin',
  hospital_owner:   'Hospital Owner',
  doctor:           'Doctor',
  receptionist:     'Receptionist',
  lab_technician:   'Lab Technician',
  care_coordinator: 'Care Coordinator',
};

export function Sidebar() {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar, activeUser, canAccess, loginAs, logout, hasActiveSubscription } = useUIStore();
  const [showRolePicker, setShowRolePicker] = useState(false);
  const rolePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showRolePicker) return;
    function handleClickOutside(event: MouseEvent) {
      if (rolePickerRef.current && !rolePickerRef.current.contains(event.target as Node)) {
        setShowRolePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRolePicker]);

  // Filter nav items to only what the current user can access; Super Admin requires Madhur master authentication
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.module === 'super_admin') {
      return activeUser?.role === 'super_admin' && activeUser?.email === 'madhur@futoragroup.com';
    }
    return canAccess(item.module as Parameters<typeof canAccess>[0]);
  });

  return (
    <aside
      style={{
        width: sidebarCollapsed ? '64px' : '240px',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        zIndex: 45,
        overflow: 'hidden',
        boxShadow: '1px 0 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          borderBottom: '1px solid var(--sidebar-border)',
          flexShrink: 0,
          gap: '0.625rem',
        }}
      >
        <div
          style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Activity size={18} color="white" />
        </div>
        {!sidebarCollapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Futoracare
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              AI OS Platform
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
        {visibleNavItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={cn('nav-item', activeView === item.view && 'active')}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', position: 'relative', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <span style={{ flexShrink: 0, color: activeView === item.view ? 'var(--sidebar-active)' : 'var(--sidebar-text)' }}>{item.icon}</span>
            {!sidebarCollapsed && <span style={{ color: activeView === item.view ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)' }}>{item.label}</span>}
            {!sidebarCollapsed && item.badge && (
              <span style={{
                marginLeft: 'auto',
                background: '#ef4444',
                color: 'white',
                borderRadius: '99px',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '1px 6px',
                flexShrink: 0,
              }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Role Switcher (Quick Login) */}
      <div ref={rolePickerRef} style={{ borderTop: '1px solid var(--sidebar-border)', padding: '0.5rem', flexShrink: 0, position: 'relative' }}>
        {/* Current User */}
        {activeUser && !sidebarCollapsed && (
          <div
            onClick={() => setShowRolePicker(!showRolePicker)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.625rem 0.75rem', borderRadius: '8px',
              cursor: 'pointer', background: showRolePicker ? 'var(--sidebar-hover)' : 'transparent',
              transition: 'background 0.15s',
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2563eb22, #06b6d422)',
              border: '2px solid var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)',
            }}>
              {activeUser.avatarInitials ?? activeUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeUser.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {ROLE_LABELS[activeUser.role]}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" style={{ transform: showRolePicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
          </div>
        )}

        {/* User Account Popover */}
        {showRolePicker && !sidebarCollapsed && (
          <div style={{
            position: 'absolute', bottom: '80px', left: '8px', right: '8px',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden',
          }}>
            <div style={{ padding: '0.75rem 0.875rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeUser?.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-all' }}>
                {activeUser?.email}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: '6px',
                fontSize: '0.68rem',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '2px 8px',
                borderRadius: '99px',
                fontWeight: 700,
              }}>
                {ROLE_LABELS[activeUser?.role || ''] || activeUser?.role}
              </div>
            </div>
            <div style={{ padding: '0.5rem 0.875rem' }}>
              <button
                onClick={() => { logout(); setShowRolePicker(false); }}
                style={{
                  width: '100%', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  cursor: 'pointer', color: '#ef4444', fontSize: '0.8125rem', padding: '0.375rem 0', fontWeight: 600,
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          style={{
            width: '100%', border: 'none', background: 'none',
            padding: '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
            cursor: 'pointer', color: 'var(--sidebar-text)', borderRadius: '8px', transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
