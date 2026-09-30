'use client';

import { useState } from 'react';
import { AppointmentStatus } from '@/types';
import { cn, getInitials } from '@/lib/utils';
import { Search, Plus, CheckCircle, X, MessageCircle, Calendar } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/store/toastStore';

const TABS: { label: string; value: AppointmentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Missed', value: 'missed' },
];

export function AppointmentsView() {
  const [activeTab, setActiveTab] = useState<AppointmentStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data: appointments = [], isLoading, updateStatus } = useAppointments(
    activeTab === 'all' ? undefined : activeTab,
    search || undefined
  );

  const handleWhatsAppAlert = (patientName: string) => {
    toast.success(
      'WhatsApp Reminder Sent',
      `Sent appointment confirmation and hospital location to ${patientName}.`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Appointments</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
            {appointments.length} appointments found
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={15} /> New Appointment
        </button>
      </div>

      <div className="surface" style={{ overflow: 'hidden' }}>
        {/* Filter bar */}
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn('tab-pill', activeTab === tab.value && 'active')}
            >
              {tab.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input-field"
              placeholder="Search patient or doctor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem', width: '220px' }}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : appointments.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>No Appointments Found</div>
            <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
              No scheduled appointments match your filter criteria.
            </p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setModalOpen(true)}>
              <Plus size={14} /> Book New Appointment
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor / Dept</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                    <Calendar size={36} style={{ margin: '0 auto 8px', opacity: 0.35, color: 'var(--primary)' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>No Appointments Found</div>
                    <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>No consultations found matching the current filters.</p>
                    <button className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }} onClick={() => setModalOpen(true)}>
                      <Plus size={14} /> Book New Appointment
                    </button>
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                          {getInitials(appt.patientName)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{appt.patientName}</span>
                      </div>
                    </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{appt.doctorName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.department}</div>
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <div style={{ fontWeight: 500 }}>{new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.time}</div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: appt.type === 'teleconsult' ? '#f0fdf4' : '#f8fafc', color: appt.type === 'teleconsult' ? '#16a34a' : '#64748b', border: '1px solid var(--border)' }}>
                      {appt.type === 'teleconsult' ? '📹 Teleconsult' : '🏥 In-Person'}
                    </span>
                  </td>
                  <td>
                    <span className={cn('badge', `badge-${appt.status}`)}>
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {appt.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus({ id: appt.id, status: 'completed' })}
                          title="Mark Completed"
                          style={{ padding: '4px', border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center' }}
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {appt.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus({ id: appt.id, status: 'cancelled' })}
                          title="Cancel"
                          style={{ padding: '4px', border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleWhatsAppAlert(appt.patientName)}
                        title="Send WhatsApp Reminder"
                        style={{ padding: '4px', border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', color: '#25d366', display: 'flex', alignItems: 'center' }}
                      >
                        <MessageCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        )}
      </div>

      <NewAppointmentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
