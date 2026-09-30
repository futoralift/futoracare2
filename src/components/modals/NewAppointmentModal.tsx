'use client';

import { useState } from 'react';
import { X, Calendar, User } from 'lucide-react';
import { toast } from '@/store/toastStore';

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Endocrinology',
  'Obstetrics',
  'Orthopedics',
  'Neurology',
  'Pediatrics',
  'Dermatology',
];

const DOCTORS: Record<string, string[]> = {
  'General Medicine': ['Dr. Arun Mehta', 'Dr. Ramesh Nair'],
  Cardiology: ['Dr. Vijay Kapoor', 'Dr. Anand Verma'],
  Endocrinology: ['Dr. Arun Mehta', 'Dr. Preethi Kumar'],
  Obstetrics: ['Dr. Sunita Rao', 'Dr. Radhika Sharma'],
  Orthopedics: ['Dr. Ramesh Nair', 'Dr. Suresh Sen'],
  Neurology: ['Dr. Arvind Joshi', 'Dr. Meera Iyer'],
  Pediatrics: ['Dr. Sanjay Guha', 'Dr. Tina Roy'],
  Dermatology: ['Dr. Vikram Seth', 'Dr. Anita Desai'],
};

export function NewAppointmentModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [patientName, setPatientName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [doctorName, setDoctorName] = useState(DOCTORS[DEPARTMENTS[0]][0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [type, setType] = useState<'in-person' | 'teleconsult'>('in-person');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDeptChange = (dept: string) => {
    setDepartment(dept);
    const availableDocs = DOCTORS[dept] || ['Dr. General Physician'];
    setDoctorName(availableDocs[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      toast.error('Validation Error', 'Patient name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          doctorName,
          department,
          date,
          time,
          type,
          notes,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to book appointment');
      }

      toast.success('Appointment Scheduled', `Booked for ${patientName} on ${date} at ${time}`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      toast.error('Booking Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Calendar size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Book New Appointment</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schedule clinic visit or teleconsultation</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Patient Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input-field"
                placeholder="e.g. Rajesh Verma"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Department
              </label>
              <select
                className="input-field"
                value={department}
                onChange={(e) => handleDeptChange(e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Attending Doctor
              </label>
              <select
                className="input-field"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              >
                {(DOCTORS[department] || ['Dr. General Physician']).map((doc) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Date
              </label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Time Slot
              </label>
              <select
                className="input-field"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '04:00 PM'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Consultation Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: '🏥 In-Person Visit', value: 'in-person' },
                { label: '📹 Teleconsultation', value: 'teleconsult' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setType(m.value as 'in-person' | 'teleconsult')}
                  style={{
                    padding: '0.625rem',
                    borderRadius: '8px',
                    border: `1.5px solid ${type === m.value ? 'var(--primary)' : 'var(--border)'}`,
                    background: type === m.value ? 'var(--primary-light)' : 'var(--bg-elevated)',
                    color: type === m.value ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Clinical Notes / Chief Complaint (Optional)
            </label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="e.g. Regular follow-up for blood glucose check"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
