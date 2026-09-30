'use client';

import { useState, useEffect } from 'react';
import { StaffMember, StaffRole, AppModule, ROLE_PERMISSIONS } from '@/types';
import { X, Plus, Trash2, UserPlus, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

const ROLE_OPTIONS: { value: StaffRole; label: string; color: string }[] = [
  { value: 'hospital_owner',   label: 'Hospital Owner',   color: '#2563eb' },
  { value: 'doctor',           label: 'Doctor',           color: '#10b981' },
  { value: 'receptionist',     label: 'Receptionist',     color: '#8b5cf6' },
  { value: 'lab_technician',   label: 'Lab Technician',   color: '#f59e0b' },
  { value: 'care_coordinator', label: 'Care Coordinator', color: '#06b6d4' },
];

const MODULE_LABELS: Record<AppModule, string> = {
  dashboard: 'Dashboard',
  appointments: 'Appointments',
  patients: 'Patients',
  whatsapp: 'WhatsApp AI',
  'voice-calls': 'Voice Calls',
  reports: 'Reports & Labs',
  csat: 'CSAT & Sentiment',
  analytics: 'Analytics',
  workflows: 'Workflows',
  settings: 'Settings',
  super_admin: 'Super Admin',
};

interface Props {
  tenantId: string;
  tenantName: string;
  onClose: () => void;
}

interface NewStaff {
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: string;
}

const emptyStaff = (): NewStaff => ({ name: '', email: '', phone: '', role: 'doctor', department: '' });

export function StaffRosterModal({ tenantId, tenantName, onClose }: Props) {
  const [existing, setExisting] = useState<StaffMember[]>([]);
  const [form, setForm] = useState<NewStaff>(emptyStaff());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [successList, setSuccessList] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/staff?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((d) => { setExisting(d.data ?? []); setIsFetching(false); })
      .catch(() => setIsFetching(false));
  }, [tenantId]);

  async function addStaff() {
    if (!form.name || !form.email || !form.phone) { setError('Name, email, and phone are required.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add staff');
      setExisting((prev) => [...prev, data.data as StaffMember]);
      setSuccessList((prev) => [...prev, data.data.name]);
      setForm(emptyStaff());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error adding staff');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, backdropFilter: 'blur(4px)', padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)', borderRadius: '20px',
          width: '100%', maxWidth: '640px', boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)', overflow: 'hidden',
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Set Up Staff Roster</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>{tenantName}</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'var(--bg-hover)', cursor: 'pointer', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Add New Staff Form */}
          <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} color="var(--primary)" /> Add Staff Member
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Full Name</label>
                <input className="input-field" placeholder="Dr. Ramesh Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Role</label>
                <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}>
                  {ROLE_OPTIONS.filter((r) => r.value !== 'hospital_owner').map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Email</label>
                <input className="input-field" placeholder="ramesh@hospital.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone</label>
                <input className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Department (optional)</label>
                <input className="input-field" placeholder="e.g. Cardiology" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
            </div>

            {/* Module Access Preview */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--border)', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Module Access for {ROLE_OPTIONS.find((r) => r.value === form.role)?.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {ROLE_PERMISSIONS[form.role].map((mod) => (
                  <span key={mod} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '99px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                    {MODULE_LABELS[mod]}
                  </span>
                ))}
              </div>
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.625rem' }}>{error}</div>}

            <button className="btn-primary" onClick={addStaff} disabled={isLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={15} />}
              Add to Roster
            </button>
          </div>

          {/* Current Roster */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Current Roster ({existing.length} members)
            </div>
            {isFetching ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading…</div>
            ) : existing.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontStyle: 'italic' }}>No staff members yet. Add your first team member above.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {existing.map((s) => {
                  const roleInfo = ROLE_OPTIONS.find((r) => r.value === s.role);
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        background: `${roleInfo?.color}22`, border: `2px solid ${roleInfo?.color}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800, color: roleInfo?.color,
                      }}>
                        {s.avatarInitials ?? s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email} • {s.phone}</div>
                      </div>
                      <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '99px', background: `${roleInfo?.color}22`, color: roleInfo?.color, fontWeight: 700, flexShrink: 0 }}>
                        {roleInfo?.label}
                      </span>
                      {successList.includes(s.name) && <CheckCircle2 size={16} color="#10b981" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button className="btn-primary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Done — Enter Portal <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
