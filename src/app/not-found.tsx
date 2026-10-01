import Link from 'next/link';
import { ArrowLeft, Stethoscope } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-app, #0f172a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'var(--font-inter), sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          background: 'var(--bg-surface, #1e293b)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: '#ffffff',
        }}
      >
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
            marginBottom: '1.5rem',
          }}
        >
          <Stethoscope size={32} />
        </div>

        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            margin: '0 0 0.5rem',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </h1>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#f8fafc' }}>
          Page Not Found
        </h2>

        <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
          The requested page could not be located on the Futoracare Platform. Please check the URL or return to the main dashboard.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
          }}
        >
          <ArrowLeft size={16} /> Return to Futoracare OS
        </Link>
      </div>
    </div>
  );
}
