'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '@/components/ui/Toast';
import { OmniModal } from '@/components/modals/OmniModal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Lock, CreditCard, AlertTriangle } from 'lucide-react';
import { PLAN_PRICES, PLAN_LABELS } from '@/types';

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    theme,
    activeView,
    sidebarCollapsed,
    isAuthenticated,
    isSubscriptionLocked,
    subscriptionPlan,
    completePaymentAndUnlock,
    setActiveView,
  } = useUIStore();

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Full-width layout for SaaS Product Landing Page
  if (activeView === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem' }} className="animate-fade-in">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <OmniModal />
        <ToastContainer />
      </div>
    );
  }

  // 🔒 HARD SCREEN LOCK: When 7-Day Free Trial Ends or Autopay Payment is pending
  if (isSubscriptionLocked) {
    const planPrice = PLAN_PRICES[subscriptionPlan]?.monthly ?? 8000;
    const planLabel = PLAN_LABELS[subscriptionPlan] ?? 'Growth Hospital';

    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}>
        <div style={{
          background: 'var(--bg-surface)', border: '2px solid #ef4444',
          borderRadius: '20px', padding: '2.5rem', textAlign: 'center',
          maxWidth: '520px', width: '100%', boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 1.25rem',
            background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#dc2626', border: '1px solid #fecaca',
          }}>
            <Lock size={32} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '99px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <AlertTriangle size={13} /> Trial Ended • Screen Locked
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            7-Day Free Trial Concluded
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Your hospital&apos;s trial period has ended. The portal is locked until recurring monthly payment is completed via your configured autopay mandate.
          </p>

          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Pending Monthly Invoice
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Enrolled Plan:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{planLabel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Autopay Method:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>UPI Autopay / e-Mandate</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Amount Due:</span>
              <span style={{ fontWeight: 900, fontSize: '1.35rem', color: 'var(--primary)' }}>₹{planPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => {
                completePaymentAndUnlock();
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem' }}
            >
              <CreditCard size={18} /> Authorize Monthly Autopay &amp; Unlock Screen
            </button>
            <button
              onClick={() => setActiveView('landing')}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem' }}
            >
              Switch Account / Back to Landing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Paywall — user not authenticated or subscription lapsed
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-app)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '2.5rem', textAlign: 'center',
          maxWidth: '420px', width: '90%', boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 1rem',
            background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={24} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Subscription Required
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Access to the Futoracare portal requires an active subscription or free trial.
          </p>
          <button
            onClick={() => setActiveView('landing')}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Start 7-Day Free Trial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? '64px' : '240px',
          transition: 'margin-left 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Topbar />
        <main
          style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
          className="animate-fade-in"
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <OmniModal />
      <ToastContainer />
    </div>
  );
}
