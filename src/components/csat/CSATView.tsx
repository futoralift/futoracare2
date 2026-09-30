'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useCSAT } from '@/hooks/useCSAT';
import { Skeleton } from '@/components/ui/Skeleton';

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          style={{ color: i <= rating ? '#f59e0b' : 'var(--border-strong)', fill: i <= rating ? '#f59e0b' : 'transparent' }}
        />
      ))}
    </div>
  );
}

const EMOTION_CONFIG = {
  delighted: { emoji: '😁', label: 'Delighted', color: '#16a34a', bg: '#f0fdf4' },
  satisfied: { emoji: '😊', label: 'Satisfied', color: '#2563eb', bg: '#eff6ff' },
  neutral: { emoji: '😐', label: 'Neutral', color: '#64748b', bg: '#f8fafc' },
  frustrated: { emoji: '😤', label: 'Frustrated', color: '#d97706', bg: '#fffbeb' },
  angry: { emoji: '😠', label: 'Angry', color: '#dc2626', bg: '#fef2f2' },
} as const;

export function CSATView() {
  const { data: feedbackList = [], isLoading } = useCSAT();
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');

  const filtered = selectedEmotion === 'all'
    ? feedbackList
    : feedbackList.filter((f) => f.emotion === selectedEmotion);

  const avg = feedbackList.length > 0
    ? (feedbackList.reduce((s, f) => s + f.rating, 0) / feedbackList.length).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: feedbackList.filter((f) => f.rating === r).length,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>CSAT & Sentiment Analysis</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>Real-time patient satisfaction tracking with automated AI apology dispatch</p>
      </div>

      {/* Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', alignItems: 'center' }}>
        <div className="surface" style={{ padding: '1.5rem 2rem', textAlign: 'center', minWidth: '170px' }}>
          {isLoading ? (
            <Skeleton style={{ width: '80px', height: '48px', margin: '0 auto 10px' }} />
          ) : (
            <>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.04em' }}>{avg}</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StarRating rating={Math.round(parseFloat(avg))} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                out of 5.0 • {feedbackList.length} reviews
              </div>
            </>
          )}
        </div>

        <div className="surface" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ratingCounts.map((rc) => (
              <div key={rc.rating} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ display: 'flex', gap: '2px', width: '80px', flexShrink: 0 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={11} style={{ color: i <= rc.rating ? '#f59e0b' : 'var(--border)', fill: i <= rc.rating ? '#f59e0b' : 'transparent' }} />
                  ))}
                </div>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${(rc.count / (feedbackList.length || 1)) * 100}%` }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '20px', textAlign: 'right' }}>{rc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emotion Breakdown */}
      <div className="surface" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Emotion Breakdown</div>
          {selectedEmotion !== 'all' && (
            <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => setSelectedEmotion('all')}>
              Clear Filter
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
          {(Object.keys(EMOTION_CONFIG) as Array<keyof typeof EMOTION_CONFIG>).map((emotion) => {
            const count = feedbackList.filter((f) => f.emotion === emotion).length;
            const cfg = EMOTION_CONFIG[emotion];
            const isSelected = selectedEmotion === emotion;
            return (
              <div
                key={emotion}
                onClick={() => setSelectedEmotion(isSelected ? 'all' : emotion)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  background: cfg.bg,
                  border: `2px solid ${isSelected ? cfg.color : `${cfg.color}22`}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1.125rem' }}>{cfg.emoji}</span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{count} reviews</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {filtered.length === 0 ? (
          <div className="surface" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>No Feedback Collected Yet</div>
            <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Patient CSAT ratings and emotion analysis will appear here after automated post-visit surveys are completed.</p>
          </div>
        ) : (
          filtered.map((f) => {
            const eCfg = EMOTION_CONFIG[f.emotion];
            return (
              <div key={f.id} className="surface" style={{ padding: '1.125rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--primary)' }}>
                      {f.patientName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{f.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.department} • {f.date}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <StarRating rating={f.rating} />
                    <span className="badge" style={{ background: eCfg.bg, color: eCfg.color, borderColor: `${eCfg.color}33` }}>
                      {eCfg.emoji} {eCfg.label}
                    </span>
                    {f.autoApologyDispatched && (
                      <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.65rem' }}>
                        ✅ Auto-Apology Dispatched
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '0.625rem' }}>
                  &quot;{f.comment}&quot;
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
