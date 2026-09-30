'use client';

import { useState } from 'react';
import { X, PhoneCall } from 'lucide-react';
import { toast } from '@/store/toastStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TriggerVoiceCallModal({ isOpen, onClose, onSuccess }: Props) {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [purpose, setPurpose] = useState('Appointment Reminder');
  const [language, setLanguage] = useState('English (India)');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !phone.trim()) {
      toast.error('Validation Error', 'Please enter patient name and phone.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/voice-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          phone,
          purpose: `${purpose} (${language})`,
          aiHandled: true,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Call dispatch failed');
      }

      toast.success('AI Voice Call Initiated', `Connecting outbound call to ${patientName} (${phone})`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Dispatch failed';
      toast.error('Dispatch Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <PhoneCall size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Trigger AI Voice Call</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated patient outreach & reminders</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Patient Name *
            </label>
            <input
              className="input-field"
              placeholder="e.g. Ramesh Chandra"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Recipient Phone *
            </label>
            <input
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98400 12345"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Call Campaign / Purpose
            </label>
            <select className="input-field" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              <option>Appointment Reminder</option>
              <option>Post-Op Recovery Follow-up</option>
              <option>Lab Diagnostic Report Delivery</option>
              <option>Missed Appointment Rescheduling</option>
              <option>Medication Adherence Check</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Conversational Voice Model
            </label>
            <select className="input-field" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English (India) — Natural Warm</option>
              <option>Hindi (India) — Professional</option>
              <option>Telugu (India) — Standard</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Initiating Call...' : '📞 Start Call Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
