'use client';

import { useUIStore } from '@/store/uiStore';
import { Bell, Search, Sun, Moon, ArrowLeft, Clock, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useTenants } from '@/hooks/useTenants';
import { useAppointments } from '@/hooks/useAppointments';
import { useLabReports } from '@/hooks/useLabReports';

export function Topbar() {
  const {
    theme,
    toggleTheme,
    activeTenantId,
    setActiveTenantId,
    setOmniOpen,
    notifOpen,
    setNotifOpen,
    activeUser,
    isAuthenticated,
    setActiveView,
    canAccess,
    isTrial,
    completePaymentAndUnlock,
    simulateTrialExpiry,
  } = useUIStore();

  const { tenants } = useTenants();
  const { data: appointments = [] } = useAppointments();
  const { data: labReports = [] } = useLabReports();

  const notifications = useMemo(() => {
    return [
      ...labReports
        .filter((r) => r.status === 'critical')
        .map((r) => ({
          id: `lab-${r.id}`,
          title: '⚠️ Critical Lab Alert',
          desc: `${r.patientName} – ${r.testName} (Critical)`,
          time: r.date,
          color: '#ef4444',
        })),
      ...appointments
        .filter((a) => a.status === 'missed')
        .map((a) => ({
          id: `appt-${a.id}`,
          title: '📅 Missed Consultation',
          desc: `${a.patientName} – ${a.time} slot`,
          time: a.date,
          color: '#f59e0b',
        })),
    ];
  }, [labReports, appointments]);

  const notifRef = useRef<HTMLDivElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.userAgent));
  }, []);

  // Click-outside listener for notifications dropdown
  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen, setNotifOpen]);

  return (
    <header
      style={{
        height: '60px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.25rem',
        gap: '0.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Back to Landing */}
      <button
        onClick={() => setActiveView('landing')}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          border: 'none', background: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '0.375rem 0.625rem',
          borderRadius: '6px', transition: 'all 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
        title="Back to Landing"
      >
        <ArrowLeft size={15} />
        <span style={{ whiteSpace: 'nowrap' }}>Overview</span>
      </button>

      {/* Omnibar Search */}
      <button
        onClick={() => setOmniOpen(true)}
        style={{
          flex: 1,
          maxWidth: '420px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.5rem 0.875rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          cursor: 'text',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary-muted)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
      >
        <Search size={15} />
        <span>Search patients, doctors, actions…</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', background: 'var(--border)', color: 'var(--text-muted)', borderRadius: '4px', padding: '1px 5px', fontWeight: 600 }}>
          {isMac ? '⌘K' : 'Ctrl+K'}
        </span>
      </button>

      {/* 7-Day Trial Badge & Actions */}
      {isAuthenticated && isTrial && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: '99px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            <Clock size={12} /> 7-Day Free Trial
          </span>
          <button
            onClick={() => completePaymentAndUnlock()}
            style={{
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '4px 9px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
            title="Authorize monthly autopay & unlock all features"
          >
            <CreditCard size={12} /> Pay &amp; Unlock
          </button>
          <button
            onClick={() => simulateTrialExpiry()}
            style={{
              border: '1px solid #fca5a5',
              background: '#fff1f2',
              color: '#be123c',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '3px 7px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
            title="Simulate 7-day trial expiry to verify lockout behavior"
          >
            <Lock size={11} /> Test Lock
          </button>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Active Tenant Switcher */}
      {isAuthenticated && canAccess('settings') && tenants.length > 0 && (
        <div style={{ position: 'relative' }}>
          <select
            value={activeTenantId}
            onChange={(e) => setActiveTenantId(e.target.value)}
            style={{
              padding: '0.375rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Notifications */}
      {isAuthenticated && (
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              position: 'relative', border: 'none', background: 'none',
              cursor: 'pointer', padding: '6px', borderRadius: '8px',
              color: 'var(--text-secondary)', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#ef4444', border: '2px solid var(--bg-surface)',
              }} />
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: '340px', background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Live System Alerts</span>
                {notifications.length > 0 ? (
                  <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>{notifications.length} New</span>
                ) : (
                  <span className="badge badge-positive" style={{ fontSize: '0.65rem' }}>All Clear</span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>All Systems Clear</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>No active alerts or critical escalations.</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.color, marginTop: '5px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.desc}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          border: 'none', background: 'none', cursor: 'pointer',
          padding: '6px', borderRadius: '8px', color: 'var(--text-secondary)', transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
        title="Toggle theme"
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* User Avatar */}
      {isAuthenticated && activeUser && (
        <div
          style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0, cursor: 'pointer',
          }}
          title={`${activeUser.name} (${activeUser.role})`}
        >
          {activeUser.avatarInitials ?? activeUser.name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </header>
  );
}
