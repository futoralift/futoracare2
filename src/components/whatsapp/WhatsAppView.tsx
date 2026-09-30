'use client';

import { useState, useRef, useEffect } from 'react';
import { WhatsAppThread } from '@/types';
import { getInitials } from '@/lib/utils';
import { Send, User, Cpu, Users, Lock, Sparkles, MessageCircle } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { toast } from '@/store/toastStore';
import { useUIStore } from '@/store/uiStore';

function ThreadList({
  threads,
  activeId,
  onSelect,
}: {
  threads: WhatsAppThread[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ width: '280px', borderRight: '1px solid var(--border)', flexShrink: 0, overflowY: 'auto' }}>
      <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
        Active Threads ({threads.length})
      </div>
      {threads.map((t) => (
        <div
          key={t.id}
          onClick={() => onSelect(t.id)}
          style={{
            padding: '0.875rem 1rem',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border)',
            background: activeId === t.id ? 'var(--primary-light)' : 'transparent',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            if (activeId !== t.id) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            if (activeId !== t.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '4px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#25d36622',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#25d366',
                flexShrink: 0,
              }}
            >
              {getInitials(t.patientName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{t.patientName}</span>
                {t.unread > 0 && (
                  <span style={{ background: '#25d366', color: 'white', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px' }}>
                    {t.unread}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.lastMessage}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '99px',
                background: t.status === 'ai-handling' ? '#eff6ff' : t.status === 'staff-handling' ? '#fff7ed' : '#f0fdf4',
                color: t.status === 'ai-handling' ? '#2563eb' : t.status === 'staff-handling' ? '#ea580c' : '#16a34a',
              }}
            >
              {t.status === 'ai-handling' ? '🤖 AI Handled' : t.status === 'staff-handling' ? '👤 Staff Assigned' : '✅ Resolved'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.lastTime}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WhatsAppView() {
  const { data: threads = [], isLoading, sendMessage, isSending } = useWhatsApp();
  const { isTrial, whatsappAiEnabled, completePaymentAndUnlock } = useUIStore();
  const [activeId, setActiveId] = useState<string>('');
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'patient' | 'staff'>('patient');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedThreadId = activeId || (threads[0]?.id ?? '');
  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isSending]);

  const handleSend = () => {
    if (!input.trim() || !activeThread) return;

    if (!whatsappAiEnabled && mode === 'patient') {
      toast.warning(
        'WhatsApp AI Auto-Responder Locked in Free Trial',
        'Autonomous AI patient auto-replies are disabled in 7-day trial. Switch to "Staff Takeover" to reply manually, or unlock below.'
      );
    }

    sendMessage({
      threadId: activeThread.id,
      content: input.trim(),
      role: mode,
    });
    setInput('');
  };

  const handleTakeover = () => {
    setMode(mode === 'patient' ? 'staff' : 'patient');
    toast.info(
      mode === 'patient' ? 'Staff Takeover Enabled' : 'Patient Simulation Mode',
      mode === 'patient' ? 'Your messages will be sent as Clinical Staff.' : 'Simulating patient inquiry.'
    );
  };

  if (isLoading) {
    return (
      <div className="surface" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading WhatsApp AI conversations...
      </div>
    );
  }

  if (threads.length === 0 || !activeThread) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 🔒 Free Trial Locked Banner */}
        {!whatsappAiEnabled && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1px solid #fde68a',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b45309',
                  flexShrink: 0,
                }}
              >
                <Lock size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Autonomous WhatsApp AI Auto-Responder is Locked in 7-Day Free Trial</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#b45309', marginTop: '3px', lineHeight: 1.4 }}>
                  During your free trial, you can test conversations using <strong>Staff Takeover</strong> mode. 24/7 autonomous clinical AI auto-replies require an active paid subscription.
                </div>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                completePaymentAndUnlock();
                toast.success('🎉 WhatsApp AI Auto-Responder Unlocked!', 'Autonomous 24/7 patient booking & triage is now fully active.');
              }}
              style={{
                fontSize: '0.85rem',
                padding: '0.6rem 1.25rem',
                background: '#d97706',
                borderColor: '#b45309',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={15} /> Unlock WhatsApp AI (Pay &amp; Activate)
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>WhatsApp AI Agent</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>Live two-way patient chat & clinical triage simulator</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 12px' }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px', marginRight: '6px', display: 'inline-block' }} />
              WhatsApp Cloud API Connected
            </span>
          </div>
        </div>

        <div className="surface" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MessageCircle size={48} style={{ margin: '0 auto 12px', opacity: 0.4, color: '#25d366' }} />
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>No WhatsApp Conversations Yet</div>
          <p style={{ fontSize: '0.85rem', marginTop: '6px', maxWidth: '480px', margin: '6px auto 0', lineHeight: 1.5 }}>
            Patients who message your hospital WhatsApp number will automatically appear here with real-time AI triage and automated booking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 🔒 Free Trial Locked Banner */}
      {!whatsappAiEnabled && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#fde68a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b45309',
                flexShrink: 0,
              }}
            >
              <Lock size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Autonomous WhatsApp AI Auto-Responder is Locked in 7-Day Free Trial</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#b45309', marginTop: '3px', lineHeight: 1.4 }}>
                During your free trial, you can test conversations using <strong>Staff Takeover</strong> mode. 24/7 autonomous clinical AI auto-replies require an active paid subscription.
              </div>
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              completePaymentAndUnlock();
              toast.success('🎉 WhatsApp AI Auto-Responder Unlocked!', 'Autonomous 24/7 patient booking & triage is now fully active.');
            }}
            style={{
              fontSize: '0.85rem',
              padding: '0.6rem 1.25rem',
              background: '#d97706',
              borderColor: '#b45309',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={15} /> Unlock WhatsApp AI (Pay &amp; Activate)
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>WhatsApp AI Agent</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>Live two-way patient chat & clinical triage simulator</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 12px' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px', marginRight: '6px', display: 'inline-block' }} />
            WhatsApp Cloud API Connected
          </span>
        </div>
      </div>

      <div className="surface" style={{ display: 'flex', height: '620px', overflow: 'hidden' }}>
        <ThreadList threads={threads} activeId={activeThread.id} onSelect={setActiveId} />

        {/* Chat Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#25d36622', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#25d366' }}>
                {getInitials(activeThread.patientName)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{activeThread.patientName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{activeThread.phone}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-ghost"
                style={{
                  fontSize: '0.75rem',
                  background: mode === 'staff' ? 'var(--primary-light)' : 'transparent',
                  color: mode === 'staff' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderColor: mode === 'staff' ? 'var(--primary)' : 'var(--border)',
                }}
                onClick={handleTakeover}
              >
                <Users size={13} /> {mode === 'staff' ? 'Staff Mode Active' : 'Staff Takeover'}
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-elevated)' }}>
            {activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'patient' ? 'row-reverse' : 'row',
                  gap: '0.5rem',
                  alignItems: 'flex-end',
                }}
                className="animate-fade-in"
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: msg.role === 'patient' ? 'var(--primary)' : msg.role === 'ai' ? '#f0fdf4' : '#fff7ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid var(--border)',
                  }}
                >
                  {msg.role === 'patient' ? (
                    <User size={13} color="white" />
                  ) : msg.role === 'ai' ? (
                    <Cpu size={13} color="#16a34a" />
                  ) : (
                    <User size={13} color="#ea580c" />
                  )}
                </div>
                <div>
                  <div className={msg.role === 'patient' ? 'chat-bubble-patient' : msg.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-staff'}>
                    {msg.role === 'ai' && (
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🤖 Futoracare Clinical AI
                      </div>
                    )}
                    {msg.role === 'staff' && (
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ea580c', marginBottom: '3px' }}>
                        👤 Care Coordinator
                      </div>
                    )}
                    {msg.content}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '3px', textAlign: msg.role === 'patient' ? 'right' : 'left' }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isSending && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  <Cpu size={13} color="#16a34a" />
                </div>
                <div className="chat-bubble-ai" style={{ padding: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}>Futoracare AI is typing response…</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.625rem', background: 'var(--bg-surface)' }}>
            <input
              className="input-field"
              placeholder={mode === 'patient' ? 'Type simulated patient message (e.g. "I need an appointment tomorrow")…' : 'Type reply as Hospital Staff…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={handleSend} disabled={!input.trim() || isSending}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
