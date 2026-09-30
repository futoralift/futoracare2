'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Shield, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from '@/store/toastStore';

export default function AdminPortalPage() {
  const { loginAs, setActiveView } = useUIStore();
  const [email, setEmail] = useState('madhur@futoragroup.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/superadmin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();

      if (!res.ok || !json.data?.authenticated) {
        setErrorMsg(json.error || 'Authentication failed. Invalid master credentials.');
        setIsLoading(false);
        return;
      }

      const superAdminUser = json.data.user;
      loginAs(superAdminUser, 'platform', true, false);
      setActiveView('super_admin');

      toast.success(
        'Super Admin Authenticated',
        'Welcome Madhur. Platform oversight console unlocked.'
      );

      // Redirect directly to the console
      window.location.href = '/';
    } catch (_err) {
      setErrorMsg('Failed to connect to authentication gateway. Please check network.');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #090d16 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'var(--font-inter), sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(56, 189, 248, 0.15)',
          backdropFilter: 'blur(20px)',
          color: '#f8fafc',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Top Ambient Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #2563eb, #06b6d4, #8b5cf6)',
          }}
        />

        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              marginBottom: '1rem',
              boxShadow: '0 8px 24px -4px rgba(56, 189, 248, 0.3)',
            }}
          >
            <Shield size={32} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '99px',
              padding: '4px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            <Lock size={12} /> Confidential Platform Gateway
          </div>

          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: '0 0 0.25rem',
            }}
          >
            Super Admin Portal
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
            Master access point for Futoracare Group platform administration
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              color: '#f87171',
              fontSize: '0.8125rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Master Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)')}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Master Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 2.75rem 0.75rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.875rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.9375rem',
              fontWeight: 800,
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
              transition: 'opacity 0.2s',
            }}
          >
            {isLoading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <Sparkles size={16} /> Authenticate &amp; Access Super Admin <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid rgba(148, 163, 184, 0.15)', paddingTop: '1.25rem' }}>
          <a
            href="/"
            style={{
              color: '#94a3b8',
              fontSize: '0.78rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            ← Return to Hospital Portal
          </a>
        </div>
      </div>
    </div>
  );
}
