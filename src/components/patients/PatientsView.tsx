'use client';

import { useState } from 'react';
import { Patient, RiskLevel } from '@/types';
import { cn, getInitials } from '@/lib/utils';
import { Search, Plus, X, Heart, Thermometer, Activity, Droplets, User, Phone, MessageCircle, Calendar } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { AddPatientModal } from '@/components/modals/AddPatientModal';
import { NewAppointmentModal } from '@/components/modals/NewAppointmentModal';
import { TriggerVoiceCallModal } from '@/components/modals/TriggerVoiceCallModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/store/toastStore';

function RiskBadge({ level }: { level: Patient['riskLevel'] }) {
  const map = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' } as const;
  return (
    <span className={cn('badge', map[level])}>
      {level.toUpperCase()}
    </span>
  );
}

function PatientModal({
  patient,
  onClose,
  onBook,
  onCall,
}: {
  patient: Patient;
  onClose: () => void;
  onBook: (patient: Patient) => void;
  onCall: (patient: Patient) => void;
}) {
  const handleWhatsApp = () => {
    toast.success('WhatsApp Channel Opened', `Live chat initiated for ${patient.name}`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)' }}>
              {getInitials(patient.name)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>{patient.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {patient.age} yr • {patient.gender} • {patient.bloodGroup} • {patient.phone}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Risk + Diagnosis */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <RiskBadge level={patient.riskLevel} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{patient.diagnosis}</span>
          </div>

          {/* Vitals */}
          {patient.vitals && (
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.625rem', color: 'var(--text-primary)' }}>Current Vitals</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {[
                  { label: 'Blood Pressure', value: patient.vitals.bp, icon: <Activity size={16} />, color: '#ef4444' },
                  { label: 'Pulse', value: `${patient.vitals.pulse} bpm`, icon: <Heart size={16} />, color: '#ec4899' },
                  { label: 'SpO2', value: `${patient.vitals.spo2}%`, icon: <Droplets size={16} />, color: '#3b82f6' },
                  { label: 'Temperature', value: patient.vitals.temp, icon: <Thermometer size={16} />, color: '#f59e0b' },
                ].map((v) => (
                  <div key={v.label} className="surface-elevated" style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ color: v.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{v.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{v.value}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{v.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Clinical Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {patient.tags.map((tag) => (
                <span key={tag} className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary-muted)' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)', border: '1px solid var(--primary-muted)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>🤖 AI Clinical Synthesis</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Patient {patient.name} ({patient.age}yr, {patient.gender}) presents with <strong>{patient.diagnosis}</strong>.
              Risk stratification: <strong>{patient.riskLevel.toUpperCase()}</strong>. Total visits: {patient.consultations}.
              Last seen: {new Date(patient.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
              {patient.riskLevel === 'critical' && ' ⚠️ Immediate medical review recommended.'}
              {patient.riskLevel === 'high' && ' Priority follow-up within 48 hours advised.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => { onCall(patient); onClose(); }}>
              <Phone size={14} /> Call Patient
            </button>
            <button className="btn-ghost" onClick={handleWhatsApp}>
              <MessageCircle size={14} /> WhatsApp
            </button>
            <button className="btn-primary" onClick={() => { onBook(patient); onClose(); }}>
              <Calendar size={14} /> Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PatientsView() {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);

  const { data: patients = [], isLoading } = usePatients(search || undefined, filterRisk);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Patient Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>360° EHR view — {patients.length} patients</p>
        </div>
        <button className="btn-primary" onClick={() => setAddModalOpen(true)}>
          <Plus size={15} /> Add Patient
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search patients…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2rem', width: '240px' }} />
        </div>
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((r) => (
          <button key={r} onClick={() => setFilterRisk(r)} className={cn('tab-pill', filterRisk === r && 'active')}>
            {r === 'all' ? 'All Risk' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* Patient Cards Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <Skeleton style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <Skeleton style={{ width: '120px', height: '18px', marginBottom: '6px' }} />
                  <Skeleton style={{ width: '80px', height: '14px' }} />
                </div>
              </div>
              <Skeleton style={{ width: '100%', height: '16px', marginBottom: '12px' }} />
              <Skeleton style={{ width: '70%', height: '14px' }} />
            </div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="surface" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <User size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>No Patients Found</div>
          <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Try adjusting your search query or risk filters.</p>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setAddModalOpen(true)}>
            <Plus size={14} /> Register New Patient
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="surface"
              style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => setSelectedPatient(patient)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
                (e.currentTarget as HTMLDivElement).style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary)', fontSize: '0.875rem', flexShrink: 0 }}>
                    {getInitials(patient.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{patient.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{patient.age} yr • {patient.gender} • {patient.bloodGroup}</div>
                  </div>
                </div>
                <RiskBadge level={patient.riskLevel} />
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                {patient.diagnosis}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
                {patient.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary-muted)', fontSize: '0.68rem' }}>{tag}</span>
                ))}
                {patient.tags.length > 3 && <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>+{patient.tags.length - 3}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <span>{patient.consultations} consultations</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onBook={() => setBookModalOpen(true)}
          onCall={() => setCallModalOpen(true)}
        />
      )}

      <AddPatientModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <NewAppointmentModal isOpen={bookModalOpen} onClose={() => setBookModalOpen(false)} />
      <TriggerVoiceCallModal isOpen={callModalOpen} onClose={() => setCallModalOpen(false)} />
    </div>
  );
}
