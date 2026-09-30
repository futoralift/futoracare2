'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Search, X, User, Calendar, Zap, ArrowRight } from 'lucide-react';
import { Patient, Appointment, AppView } from '@/types';

export function OmniModal() {
  const { omniOpen, setOmniOpen, setActiveView } = useUIStore();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [actions, setActions] = useState<{ id: string; title: string; view: AppView; shortcut: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOmniOpen(!useUIStore.getState().omniOpen);
      } else if (e.key === 'Escape' && useUIStore.getState().omniOpen) {
        setOmniOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOmniOpen]);

  const handleClose = () => {
    setQuery('');
    setPatients([]);
    setAppointments([]);
    setActions([]);
    setOmniOpen(false);
  };

  useEffect(() => {
    if (!omniOpen) return;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (json.success && json.data) {
          setPatients(json.data.patients || []);
          setAppointments(json.data.appointments || []);
          setActions(json.data.actions || []);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Omnibar search error:', err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, omniOpen]);

  if (!omniOpen) return null;

  const navigateTo = (view: AppView) => {
    setActiveView(view);
    handleClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', gap: '10px' }}>
          <Search size={18} color="var(--primary)" />
          <input
            autoFocus
            className="input-field"
            placeholder="Search patients, doctors, appointments, or workflows… (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.95rem', boxShadow: 'none' }}
          />
          <button onClick={handleClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '1rem' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Searching Futoracare OS…
            </div>
          )}

          {!loading && patients.length === 0 && appointments.length === 0 && actions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {query ? 'No matching records found' : 'Type to search across patients, doctors, and actions…'}
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Quick Navigation & Actions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {actions.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => navigateTo(act.view)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={14} color="var(--primary)" />
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{act.title}</span>
                    </div>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patients */}
          {patients.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Patients ({patients.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {patients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigateTo('patients')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} color="var(--primary)" />
                      <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{p.age}yr • {p.diagnosis}</span>
                      </div>
                    </div>
                    <span className="badge" style={{ fontSize: '0.65rem' }}>{p.riskLevel.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments */}
          {appointments.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Appointments ({appointments.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {appointments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => navigateTo('appointments')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="var(--primary)" />
                      <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.patientName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>w/ {a.doctorName} • {a.time}</span>
                      </div>
                    </div>
                    <span className="badge" style={{ fontSize: '0.65rem' }}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
