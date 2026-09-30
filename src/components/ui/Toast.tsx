'use client';

import { useToastStore } from '@/store/toastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />,
  error: <AlertCircle size={18} className="text-rose-500 flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />,
  info: <Info size={18} className="text-blue-500 flex-shrink-0" />,
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="surface animate-fade-in"
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            boxShadow: 'var(--shadow-lg)',
            pointerEvents: 'auto',
            borderLeft: `4px solid ${
              t.type === 'success'
                ? '#10b981'
                : t.type === 'error'
                ? '#ef4444'
                : t.type === 'warning'
                ? '#f59e0b'
                : '#3b82f6'
            }`,
          }}
        >
          <div style={{ marginTop: '2px' }}>{ICONS[t.type]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {t.title}
            </div>
            {t.message && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t.message}
              </div>
            )}
          </div>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              border: 'none',
              background: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
