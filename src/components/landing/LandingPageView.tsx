'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import {
  Activity, ArrowRight, Bot, Phone, FileText, Users, Zap, BarChart3,
  ShieldCheck, CheckCircle2, Sparkles,
  Sun, Moon, MessageCircle, Lock, Clock
} from 'lucide-react';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';

export function LandingPageView() {
  const { setActiveView, theme, toggleTheme, loginAs, startDemo } = useUIStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '3rem' }}>
      {/* ── 1. Marketing Navigation Bar ──────────────────────────────────── */}
      <nav
        className="surface"
        style={{
          padding: '0.875rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: '1rem',
          zIndex: 30,
          boxShadow: 'var(--shadow-md)',
          borderRadius: '99px',
          backdropFilter: 'blur(10px)',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1 }}>
              Futoracare
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}>Healthcare AI OS</div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="hidden-mobile">
          <button onClick={() => scrollToSection('features')} className="btn-ghost" style={{ border: 'none', background: 'none' }}>
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="btn-ghost" style={{ border: 'none', background: 'none' }}>
            How It Works
          </button>
          <button onClick={() => scrollToSection('pricing')} className="btn-ghost" style={{ border: 'none', background: 'none' }}>
            SaaS Pricing
          </button>
          <button onClick={() => scrollToSection('security')} className="btn-ghost" style={{ border: 'none', background: 'none' }}>
            Security
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Theme Switch */}
          <button
            onClick={toggleTheme}
            style={{
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Moon size={14} color="#818cf8" /> : <Sun size={14} color="#f59e0b" />}
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>

          <button
            className="btn-primary"
            onClick={() => startDemo()}
            style={{
              borderRadius: '99px',
              padding: '0.55rem 1.25rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              fontWeight: 700,
            }}
          >
            <Zap size={14} />
            <span>Start Free Demo</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => setShowOnboarding(true)}
            style={{ borderRadius: '99px', padding: '0.55rem 1.1rem', fontSize: '0.8125rem' }}
          >
            <span>Trial Setup</span>
          </button>
        </div>
      </nav>

      {/* ── 2. Hero Section ──────────────────────────────────────────────── */}
      <section id="hero" style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '99px',
            background: 'var(--primary-light)',
            border: '1px solid var(--primary-muted)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--primary)',
          }}
        >
          <Sparkles size={15} />
          <span>Next-Generation Healthcare SaaS Automation Platform</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
          }}
        >
          The Autonomous AI Operating System for{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Modern Hospitals & Clinics
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '740px',
          }}
        >
          Replace disconnected legacy software with an integrated multi-tenant AI CRM.
          Manage appointments, 24/7 WhatsApp triage, automated voice follow-ups, diagnostic lab summarization, and 360° EHRs with enterprise-grade PostgreSQL RLS security.
        </p>

        {/* CTA Group */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          <button
            className="btn-primary"
            onClick={() => startDemo()}
            style={{
              padding: '0.85rem 2rem',
              fontSize: '1.05rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Zap size={18} />
            <span>Start Free Demo (Instant Access)</span>
            <ArrowRight size={18} />
          </button>
          <button
            className="btn-ghost"
            onClick={() => setShowOnboarding(true)}
            style={{ padding: '0.85rem 1.5rem', fontSize: '1rem', borderRadius: '12px' }}
          >
            Start 7-Day Free Trial
          </button>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#10b981" />
          <span>No login or credit card required • Instant access to live dashboard with sample hospital data</span>
        </div>

        {/* Trust Badges */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10b981" /> HIPAA-Ready Architecture
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10b981" /> PostgreSQL Row-Level Security
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10b981" /> 91.4% AI Automation Rate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10b981" /> WhatsApp Cloud API Verified
          </div>
        </div>
      </section>

      {/* ── 3. Social Proof — Hospitals Using Futoracare ─────────────────── */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>

        {/* Section Label */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '99px', background: 'var(--primary-light)', border: '1px solid var(--primary-muted)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
            <span className="pulse-dot" style={{ width: '8px', height: '8px' }} />
            Live Platform — Growing Every Day
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Trusted by Hospitals Across India
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Join 120+ hospitals, clinics &amp; diagnostic labs already running on Futoracare AI OS
          </p>
        </div>

        {/* Platform Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { val: '120+',     label: 'Hospitals & Clinics',     icon: '🏥', color: '#2563eb', bg: '#eff6ff' },
            { val: '8,400+',   label: 'Patients Managed Daily',  icon: '👥', color: '#10b981', bg: '#f0fdf4' },
            { val: '34',       label: 'Cities Across India',      icon: '📍', color: '#8b5cf6', bg: '#f5f3ff' },
            { val: '91.4%',    label: 'AI Auto-Resolution Rate',  icon: '🤖', color: '#06b6d4', bg: '#ecfeff' },
            { val: '₹2.4 Cr+', label: 'Revenue Managed/Month',   icon: '💰', color: '#f59e0b', bg: '#fffbeb' },
            { val: '4.8★',     label: 'Average CSAT Score',       icon: '⭐', color: '#ec4899', bg: '#fdf4ff' },
          ].map((s) => (
            <div key={s.label} className="surface" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '14px', transition: 'all 0.2s', cursor: 'default', border: `1px solid ${s.color}22` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '6px', lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Hospital Name Tiles */}
        <div className="surface" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', textAlign: 'center' }}>
            Hospitals Currently on Futoracare
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', justifyContent: 'center' }}>
            {[
              { name: 'Shree Ram Multi-Specialty, Hyderabad', plan: 'Enterprise' },
              { name: 'Apollo Clinic, Secunderabad', plan: 'Growth' },
              { name: 'Ganesh Ortho & Spine Center, KPHB', plan: 'Starter' },
              { name: 'Venkateswara Diagnostics, Vizag', plan: 'Growth' },
              { name: 'Lakshmi Narayana Hospital, Chennai', plan: 'Enterprise' },
              { name: 'Saraswathi Maternity Clinic, Pune', plan: 'Starter' },
              { name: 'Suresh Cardio Care, Bengaluru', plan: 'Growth' },
              { name: 'Patel Eye Institute, Ahmedabad', plan: 'Growth' },
              { name: 'Raghavendra Neuro Centre, Vijayawada', plan: 'Starter' },
              { name: 'Arjun Wellness Labs, Delhi NCR', plan: 'Enterprise' },
              { name: 'Ganga Ram Children Hospital, Jaipur', plan: 'Growth' },
              { name: '+ 109 more hospitals', plan: '' },
            ].map((h) => {
              const planColor = h.plan === 'Enterprise' ? { bg: '#fde68a', text: '#92400e' } : h.plan === 'Growth' ? { bg: '#d1fae5', text: '#065f46' } : h.plan === 'Starter' ? { bg: '#dbeafe', text: '#1e40af' } : { bg: 'var(--primary-light)', text: 'var(--primary)' };
              return (
                <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--bg-elevated)', borderRadius: '99px', border: '1px solid var(--border)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                  {h.name}
                  {h.plan && <span style={{ fontSize: '0.65rem', padding: '1px 7px', borderRadius: '99px', background: planColor.bg, color: planColor.text, fontWeight: 700, marginLeft: '2px' }}>{h.plan}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ── 4. Core SaaS Features Showcase ──────────────────────────────── */}
      <section id="features" style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Everything Modern Hospitals Need in One AI OS
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
            Designed for clinical directors, hospital administrators, and healthcare enterprises.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              icon: <Bot size={22} color="#2563eb" />,
              title: 'WhatsApp AI Clinical Agent',
              desc: 'Autonomous 24/7 patient booking, slot rescheduling, FAQ answers, and immediate emergency symptom escalation.',
              tag: 'Conversational AI',
            },
            {
              icon: <Phone size={22} color="#06b6d4" />,
              title: 'AI Voice Calling Engine',
              desc: 'Automated outbound reminder calls in English, Hindi & Telugu. Generates live waveforms, transcripts, and sentiment logs.',
              tag: 'Telephony Gateway',
            },
            {
              icon: <FileText size={22} color="#10b981" />,
              title: 'Diagnostic Lab AI Summarizer',
              desc: 'Detects biomarker abnormality flags (H, L, HH, LL), synthesizes clinical narratives, and dispatches PDFs via WhatsApp.',
              tag: 'Clinical Intelligence',
            },
            {
              icon: <Users size={22} color="#8b5cf6" />,
              title: '360° Electronic Health Records',
              desc: 'Longitudinal patient directory with vital signs tracking, blood group tagging, and automated triage risk scoring.',
              tag: 'EHR Directory',
            },
            {
              icon: <Zap size={22} color="#f59e0b" />,
              title: 'BullMQ Workflow Automation',
              desc: 'Orchestrates reminder sequences, follow-ups, and triggers automatic apology messages for CSAT ratings ≤ 2.',
              tag: 'Zero-Code Workflows',
            },
            {
              icon: <BarChart3 size={22} color="#ec4899" />,
              title: 'Real-Time SaaS & Dept Analytics',
              desc: 'Deep visibility into department volume distribution, wait times, revenue metrics, and AI automation coverage percentages.',
              tag: 'Executive BI',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="surface"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
                borderRadius: 'var(--radius)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'none';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.icon}
                </div>
                <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '0.68rem' }}>
                  {f.tag}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{f.title}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. How It Works Pipeline ────────────────────────────────────── */}
      <section id="how-it-works" style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Deploy in 3 Simple Steps
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
            Zero hardware required. Go live in hours with plug-and-play integrations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              step: '01',
              title: 'Connect EHR & Webhooks',
              desc: 'Configure your hospital branches, doctor rosters, and WhatsApp Business credentials in the settings console.',
            },
            {
              step: '02',
              title: 'Activate AI Workflows',
              desc: 'Enable conversational booking, automated reminder phone calls, and diagnostic lab report summarization.',
            },
            {
              step: '03',
              title: 'Monitor & Scale Live Ops',
              desc: 'Track live patient queues, CSAT sentiment scores, and automation savings directly from the Futoracare CRM dashboard.',
            },
          ].map((s) => (
            <div key={s.step} className="surface" style={{ padding: '1.75rem', borderRadius: 'var(--radius)', position: 'relative' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-muted)', opacity: 0.7, lineHeight: 1, marginBottom: '0.5rem' }}>
                {s.step}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>{s.title}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Multi-Tenant SaaS Pricing Tiers ──────────────────────────── */}
      <section id="pricing" style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Transparent Multi-Tenant SaaS Pricing
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
            Predictable per-hospital pricing with unlimited patient engagement.
          </p>

          {/* Monthly / Annual Toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: '99px', border: '1px solid var(--border)', marginTop: '1.25rem' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '99px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: billingCycle === 'monthly' ? 'var(--primary)' : 'transparent',
                color: billingCycle === 'monthly' ? 'white' : 'var(--text-secondary)',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '99px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: billingCycle === 'annual' ? 'var(--primary)' : 'transparent',
                color: billingCycle === 'annual' ? 'white' : 'var(--text-secondary)',
              }}
            >
              Annual Billing <span style={{ fontSize: '0.7rem', color: billingCycle === 'annual' ? '#bfdbfe' : '#10b981', fontWeight: 700 }}>Save 20%</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
          {[
            {
              name: 'Starter Clinic',
              price: billingCycle === 'monthly' ? '₹5,000' : '₹4,000',
              period: '/ month',
              desc: 'Ideal for single-specialty clinics & diagnostic labs up to 50 beds.',
              features: [
                'Up to 15 Doctors & 50 Beds',
                '24/7 WhatsApp AI Booking Assistant',
                '500 Automated AI Voice Calls / mo',
                '360° Patient Directory & Vitals',
                'Standard CSAT Sentiment Tracking',
                'Basic Email & Chat Support',
              ],
              popular: false,
              cta: 'Start with Clinic Plan',
            },
            {
              name: 'Growth Hospital',
              price: billingCycle === 'monthly' ? '₹8,000' : '₹6,400',
              period: '/ month',
              desc: 'Best for multi-specialty hospitals up to 250 beds with high patient volume.',
              features: [
                'Up to 75 Doctors & 250 Beds',
                'Unlimited WhatsApp AI Conversations',
                '5,000 AI Voice Calls / mo (Multi-lingual)',
                'Diagnostic Lab AI Summarizer & PDF Dispatch',
                'BullMQ Workflow Automation Engine',
                'Advanced Department Analytics & BI',
                'Priority 24/7 SLA Support',
              ],
              popular: true,
              cta: 'Launch Growth Hospital',
            },
            {
              name: 'Enterprise Health System',
              price: billingCycle === 'monthly' ? '₹10,000' : '₹8,000',
              period: '/ month',
              desc: 'Designed for hospital chains with multi-branch tenancy & custom EHR integration.',
              features: [
                'Unlimited Doctors, Beds & Multi-Branch Tenancy',
                'PostgreSQL Row-Level Security (RLS) Isolation',
                'Unlimited WhatsApp & Dedicated Telephony Trunk',
                'Custom Fine-Tuned Clinical LLM Models',
                'HIS / Epic / Cerner Webhook Connectors',
                'Custom S3 / Cloudflare R2 Lab Storage',
                'Dedicated Technical Account Manager',
              ],
              popular: false,
              cta: 'Contact Enterprise Sales',
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="surface"
              style={{
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: plan.popular ? 'var(--bg-surface)' : 'var(--bg-surface)',
                boxShadow: plan.popular ? '0 10px 30px rgba(37,99,235,0.15)' : 'var(--shadow-sm)',
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '3px 14px',
                    borderRadius: '99px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Most Popular
                </div>
              )}

              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{plan.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', minHeight: '38px' }}>{plan.desc}</div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '1.5rem 0 1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{plan.price}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>

              <button
                className={plan.popular ? 'btn-primary' : 'btn-ghost'}
                onClick={() => setShowOnboarding(true)}
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}
              >
                {plan.cta}
              </button>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Included Capabilities:</div>
                {plan.features.map((feat) => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Security & Compliance ────────────────────────────────────── */}
      <section id="security" style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div className="surface" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <ShieldCheck size={28} color="#10b981" />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Enterprise Security & Clinical Governance
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '780px' }}>
            Patient data privacy and healthcare compliance are baked into the core of Futoracare. We enforce tenant-level isolation, end-to-end data encryption in transit and at rest, and clinical audit trails.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
            {[
              { icon: <Lock size={18} color="var(--primary)" />, title: 'Row-Level Security (RLS)', desc: 'PostgreSQL database isolation prevents cross-tenant data leakage.' },
              { icon: <ShieldCheck size={18} color="var(--primary)" />, title: 'HSTS & CSP Headers', desc: 'Enterprise HTTP security headers protect against XSS and clickjacking.' },
              { icon: <Clock size={18} color="var(--primary)" />, title: 'Audit Trail Logging', desc: 'Comprehensive timestamped audit logs for all medical actions and dispatches.' },
              { icon: <CheckCircle2 size={18} color="var(--primary)" />, title: 'Zod Input Sanitization', desc: 'Strict payload validation prevents injection and malformed inputs.' },
            ].map((s) => (
              <div key={s.title} style={{ padding: '1rem', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{s.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Bottom CTA Banner ────────────────────────────────────────── */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div
          className="gradient-primary"
          style={{
            padding: '3rem 2rem',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Ready to Automate Your Hospital Operations?
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '620px' }}>
            Join forward-thinking hospitals delivering sub-second patient responses, zero missed follow-ups, and automated lab summaries.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setActiveView('dashboard')}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                background: 'white',
                color: '#2563eb',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              Open Live Hospital Portal
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              View Multi-Tenant Pricing
            </button>
          </div>
        </div>
      </section>

      {/* ── 9. Footer ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Futoracare AI OS</span>
          <span>• Production-Ready Healthcare SaaS Platform</span>
        </div>
        <div>
          © 2026 Futoracare Health Inc. All rights reserved.
        </div>
      </footer>

      {/* Onboarding / Checkout Modal */}
      {showOnboarding && (
        <OnboardingModal
          initialPlan="growth"
          billingCycle={billingCycle}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
