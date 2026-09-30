'use client';

import { useState } from 'react';
import { VoiceCall } from '@/types';
import { cn, getInitials } from '@/lib/utils';
import { Phone, PhoneOff, ChevronDown, ChevronUp, Mic, Play, Plus } from 'lucide-react';
import { useVoiceCalls } from '@/hooks/useVoiceCalls';
import { TriggerVoiceCallModal } from '@/components/modals/TriggerVoiceCallModal';
import { TableSkeleton } from '@/components/ui/Skeleton';

function WaveformBar({ active }: { active: boolean }) {
  const heights = [4, 12, 20, 8, 16, 6, 18, 10, 20, 4, 14, 20, 8, 16, 12, 6, 18, 10, 14, 8];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '28px' }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className={active ? 'waveform-bar' : ''}
          style={{
            width: '3px',
            borderRadius: '2px',
            background: active ? 'var(--primary)' : 'var(--border)',
            height: active ? undefined : `${h}px`,
            animationDelay: active ? `${(i * 0.05) % 0.8}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: VoiceCall['sentiment'] }) {
  const map = {
    positive: { label: '😊 Positive', cls: 'badge-positive' },
    neutral: { label: '😐 Neutral', cls: 'badge-neutral' },
    negative: { label: '😞 Negative', cls: 'badge-negative' },
  };
  const { label, cls } = map[sentiment];
  return <span className={cn('badge', cls)}>{label}</span>;
}

function CallRow({ call }: { call: VoiceCall }) {
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <tr>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
              {getInitials(call.patientName)}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{call.patientName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{call.phone}</div>
            </div>
          </div>
        </td>
        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{call.purpose}</td>
        <td>
          <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}>{call.date}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{call.time}</div>
        </td>
        <td style={{ fontVariantNumeric: 'tabular-nums' }}>{call.duration || '—'}</td>
        <td>
          <span className={cn('badge', call.status === 'completed' ? 'badge-completed' : call.status === 'missed' ? 'badge-missed' : 'badge-pending')}>
            {call.status === 'completed' ? <Phone size={11} /> : <PhoneOff size={11} />}
            {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
          </span>
        </td>
        <td><SentimentBadge sentiment={call.sentiment} /></td>
        <td>
          <span className="badge" style={{ background: call.aiHandled ? '#eff6ff' : '#f8fafc', color: call.aiHandled ? '#2563eb' : '#64748b', border: '1px solid var(--border)' }}>
            {call.aiHandled ? '🤖 AI Automated' : '👤 Human Agent'}
          </span>
        </td>
        <td>
          {call.transcript && call.transcript.length > 0 ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn-ghost"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Transcript
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No transcript</span>
          )}
        </td>
      </tr>

      {expanded && call.transcript && (
        <tr>
          <td colSpan={8} style={{ background: 'var(--bg-elevated)', padding: 0 }}>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Waveform Player */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setPlaying(!playing)}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}
                >
                  {playing ? <Mic size={14} /> : <Play size={14} />}
                </button>
                <WaveformBar active={playing} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {playing ? 'Playing AI Recording…' : call.duration}
                </span>
              </div>

              {/* Transcript lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {call.transcript.map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '36px', paddingTop: '2px', fontVariantNumeric: 'tabular-nums' }}>{line.timestamp}</div>
                    <span className="badge" style={{
                      background: line.speaker === 'AI' ? '#eff6ff' : '#f8fafc',
                      color: line.speaker === 'AI' ? '#2563eb' : '#64748b',
                      border: '1px solid var(--border)',
                      flexShrink: 0,
                      fontSize: '0.65rem',
                    }}>
                      {line.speaker === 'AI' ? '🤖 AI' : '👤 Patient'}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{line.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function VoiceCallsView() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: calls = [], isLoading } = useVoiceCalls();

  const aiCount = calls.filter((c) => c.aiHandled).length;
  const positiveSentimentCount = calls.length === 0 ? 0 : Math.round((calls.filter((c) => c.sentiment === 'positive').length / calls.length) * 100);
  const avgDuration = calls.length === 0 ? '0s' : `${Math.round(calls.reduce((s, c) => s + (parseInt(c.duration) || 3), 0) / calls.length)}m`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>AI Voice Calls Engine</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>Outbound automated AI calls — appointment reminders & clinical triage</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={15} /> Trigger AI Call
        </button>
      </div>

      {/* Stats mini */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.875rem' }}>
        {[
          { label: 'Total Calls Logged', value: calls.length, color: '#2563eb' },
          { label: 'AI Automated', value: aiCount, color: '#10b981' },
          { label: 'Avg Call Duration', value: avgDuration, color: '#f59e0b' },
          { label: 'Positive Sentiment', value: `${positiveSentimentCount}%`, color: '#8b5cf6' },
        ].map((s) => (
          <div key={s.label} className="surface" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="surface" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Purpose</th>
                <th>Date / Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Sentiment</th>
                <th>Handler</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {calls.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                    <Phone size={32} style={{ margin: '0 auto 8px', opacity: 0.35, color: 'var(--primary)' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>No AI Voice Calls Recorded</div>
                    <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Click &quot;Trigger AI Call&quot; to initiate automated appointment reminders or triage calls.</p>
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <CallRow key={call.id} call={call} />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <TriggerVoiceCallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
