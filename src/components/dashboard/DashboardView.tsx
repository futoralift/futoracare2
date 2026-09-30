'use client';

import { useState, useMemo } from 'react';
import { cn, getInitials } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie,
} from 'recharts';
import {
  Calendar, Users, MessageCircle, Phone,
  AlertTriangle, Clock, Zap, CheckCircle, Plus,
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAppointments } from '@/hooks/useAppointments';
import { useLabReports } from '@/hooks/useLabReports';
import { useUIStore } from '@/store/uiStore';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export function DashboardView() {
  const [modalOpen, setModalOpen] = useState(false);
  const { activeUser } = useUIStore();

  const [greeting] = useState(() => {
    const hour = typeof window !== 'undefined' ? new Date().getHours() : 10;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  const [currentDateFormatted] = useState(() =>
    typeof window !== 'undefined'
      ? new Date().toLocaleDateString('en-IN', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Today'
  );

  const { data: dashboardData, isLoading: isStatsLoading } = useDashboardData();
  const { data: appointments = [], isLoading: isApptsLoading } = useAppointments();
  const { data: labReports = [] } = useLabReports();

  // Dynamic Live Alerts derived from real clinical collections
  const alerts = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'critical' | 'warning';
      icon: React.ReactNode;
      title: string;
      desc: string;
      time: string;
      color: string;
      bg: string;
    }> = [];

    // Critical lab results
    for (const r of labReports) {
      if (r.status === 'critical') {
        list.push({
          id: `lab-${r.id}`,
          type: 'critical',
          icon: <AlertTriangle size={14} />,
          title: 'Critical Lab Flag',
          desc: `${r.patientName} – ${r.testName} (Critical)`,
          time: r.date,
          color: '#ef4444',
          bg: '#fef2f2',
        });
      }
    }

    // Missed appointments
    for (const a of appointments) {
      if (a.status === 'missed') {
        list.push({
          id: `appt-${a.id}`,
          type: 'warning',
          icon: <Clock size={14} />,
          title: 'Missed Consultation',
          desc: `${a.patientName} – ${a.time} slot`,
          time: a.date,
          color: '#f59e0b',
          bg: '#fffbeb',
        });
      }
    }

    return list;
  }, [labReports, appointments]);

  const stats = dashboardData?.stats || [
    { label: "Today's Appointments", value: dashboardData?.todayAppointments ?? 0, change: 0, icon: 'Calendar', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Active Patients', value: dashboardData?.totalPatients ?? 0, change: 0, icon: 'Users', color: '#10b981', bg: '#f0fdf4' },
    { label: 'WhatsApp Handled', value: dashboardData?.activeWhatsAppThreads ?? 0, change: 0, icon: 'MessageCircle', color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'AI Voice Calls', value: dashboardData?.aiAutoResolved ?? 0, change: 0, icon: 'Phone', color: '#f59e0b', bg: '#fffbeb' },
  ];

  const weeklyVolume = dashboardData?.weeklyVolume || [
    { day: 'Mon', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Tue', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Wed', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Thu', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Fri', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Sat', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
    { day: 'Sun', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
  ];

  const statusCounts = dashboardData?.statusCounts || {
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    missed: appointments.filter((a) => a.status === 'missed').length,
  };

  const totalStatusCount = statusCounts.confirmed + statusCounts.completed + statusCounts.pending + statusCounts.missed;

  const statusData = [
    { name: 'Confirmed', value: statusCounts.confirmed, color: '#2563eb' },
    { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
    { name: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
    { name: 'Missed', value: statusCounts.missed, color: '#ef4444' },
  ];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calendar': return <Calendar size={20} />;
      case 'Users': return <Users size={20} />;
      case 'MessageCircle': return <MessageCircle size={20} />;
      default: return <Phone size={20} />;
    }
  };

  const userName = activeUser?.name || 'Administrator';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {greeting}, {userName} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
            Here&apos;s your live hospital overview for {currentDateFormatted || 'today'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={15} />
          Book Appointment
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {isStatsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat: { label: string; value: string | number; change: number; icon: string; color: string; bg: string }) => (
              <div key={stat.label} className="stat-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: stat.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                    }}
                  >
                    {renderIcon(stat.icon)}
                  </div>
                  {stat.change !== 0 ? (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: stat.change > 0 ? '#16a34a' : '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Live
                    </span>
                  )}
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
      </div>

      {/* Queue & Alerts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem', alignItems: 'start' }}>
        {/* Today's Queue */}
        <div className="surface" style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                Today&apos;s Patient Queue
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--primary)',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              + Add
            </button>
          </div>

          {isApptsLoading ? (
            <TableSkeleton rows={4} />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <Calendar size={32} style={{ margin: '0 auto 8px', opacity: 0.35, color: 'var(--primary)' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>No Appointments Today</div>
                      <p style={{ fontSize: '0.78rem', marginTop: '2px' }}>Click &quot;+ Add&quot; to schedule a consultation.</p>
                    </td>
                  </tr>
                ) : (
                  appointments.slice(0, 6).map((appt) => (
                    <tr key={appt.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background: 'var(--primary-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: 'var(--primary)',
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(appt.patientName)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{appt.patientName}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{appt.doctorName}</td>
                      <td style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{appt.time}</td>
                      <td>
                        <span className="badge" style={{ background: appt.type === 'teleconsult' ? '#f0fdf4' : '#f8fafc', color: appt.type === 'teleconsult' ? '#16a34a' : '#64748b', borderColor: 'var(--border)' }}>
                          {appt.type === 'teleconsult' ? '📹' : '🏥'} {appt.type === 'teleconsult' ? 'Teleconsult' : 'In-Person'}
                        </span>
                      </td>
                      <td>
                        <span className={cn('badge', `badge-${appt.status}`)}>
                          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Dynamic Active Alerts */}
        <div className="surface" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🚨 Active Alerts</span>
            {alerts.length > 0 && (
              <span className="badge" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                {alerts.length} Active
              </span>
            )}
          </div>
          <div style={{ padding: '0.75rem' }}>
            {alerts.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle size={36} style={{ margin: '0 auto 8px', color: '#10b981' }} />
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>All Systems Clear</div>
                <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>No active alerts or critical escalations at this time.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: alert.bg,
                    border: `1px solid ${alert.color}22`,
                    marginBottom: '0.625rem',
                  }}
                >
                  <div style={{ color: alert.color, flexShrink: 0, marginTop: '2px' }}>{alert.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{alert.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{alert.desc}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{alert.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem', alignItems: 'start' }}>
        {/* Weekly Volume Bar Chart */}
        <div className="surface" style={{ padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Weekly Volume
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyVolume} barSize={12} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8125rem' }}
                cursor={{ fill: 'var(--bg-hover)' }}
              />
              <Bar dataKey="appointments" name="Appointments" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="whatsapp" name="WhatsApp" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="calls" name="AI Calls" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Status Donut */}
        <div className="surface" style={{ padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Today&apos;s Status
          </div>
          {totalStatusCount === 0 ? (
            <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)' }}>0</span>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No Status Data</div>
              <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>Consultations booked will appear here</div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8125rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {statusData.map((s) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <NewAppointmentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
