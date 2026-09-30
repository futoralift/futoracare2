'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, Line,
} from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/Skeleton';
import { BarChart3 } from 'lucide-react';

export function AnalyticsView() {
  const { data: dashboardData, isLoading } = useDashboardData();

  const deptVolume = dashboardData?.deptVolume || [];
  const weeklyVolume = dashboardData?.weeklyVolume || [
    { day: 'Mon', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Tue', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Wed', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Thu', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Fri', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Sat', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Sun', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
  ];

  const totalPatients = dashboardData?.totalPatients ?? 0;
  const todayAppts = dashboardData?.todayAppointments ?? 0;
  const aiHandled = dashboardData?.aiAutoResolved ?? 0;
  const activeThreads = dashboardData?.activeWhatsAppThreads ?? 0;
  const csat = dashboardData?.csatScore ? `${dashboardData.csatScore} / 5.0` : '0.0';

  const kpis = [
    { label: 'Active Patients', value: totalPatients, color: '#10b981', note: 'Registered in EHR' },
    { label: "Today's Consultations", value: todayAppts, color: '#2563eb', note: 'Active bookings' },
    { label: 'AI Automated Actions', value: aiHandled, color: '#8b5cf6', note: 'WhatsApp & voice bots' },
    { label: 'Active Inquiries', value: activeThreads, color: '#f59e0b', note: 'WhatsApp conversations' },
    { label: 'Patient CSAT Rating', value: csat, color: '#ec4899', note: 'Post-visit satisfaction' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Analytics & SaaS Metrics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>Department performance, AI automation coverage, and real-time operational insights</p>
      </div>

      {/* KPI Cards — Derived from live database */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {kpis.map((k) => (
          <div key={k.label} className="surface" style={{ padding: '1.125rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color, letterSpacing: '-0.02em' }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{k.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {k.note}
            </div>
          </div>
        ))}
      </div>

      {/* Department Volume Chart */}
      <div className="surface" style={{ padding: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Department Volume — Appointments vs AI Handled
        </div>
        {isLoading ? (
          <Skeleton style={{ width: '100%', height: '260px' }} />
        ) : deptVolume.length === 0 ? (
          <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
            <BarChart3 size={36} style={{ marginBottom: '8px', opacity: 0.35, color: 'var(--primary)' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Department Volume Yet</div>
            <p style={{ fontSize: '0.78rem', marginTop: '3px' }}>Consultations booked across departments will be charted here automatically.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptVolume} barSize={18} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8125rem' }} cursor={{ fill: 'var(--bg-hover)' }} />
              <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
              <Bar dataKey="appointments" name="Total Appointments" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aiHandled" name="AI Handled" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekly Activity Trend */}
      <div className="surface" style={{ padding: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Weekly Activity Trend (Omni-channel)
        </div>
        {isLoading ? (
          <Skeleton style={{ width: '100%', height: '220px' }} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyVolume}>
              <defs>
                <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8125rem' }} />
              <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
              <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#2563eb" strokeWidth={2} fill="url(#colorAppt)" />
              <Area type="monotone" dataKey="whatsapp" name="WhatsApp" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorWA)" />
              <Line type="monotone" dataKey="calls" name="AI Calls" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* AI Coverage Bars */}
      <div className="surface" style={{ padding: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          AI Automation Coverage by Clinical Department
        </div>
        {deptVolume.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No department coverage metrics to display yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {deptVolume.map((d: { name: string; appointments: number; aiHandled: number }) => {
              const pct = Math.round((d.aiHandled / (d.appointments || 1)) * 100);
              return (
                <div key={d.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444' }}>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
