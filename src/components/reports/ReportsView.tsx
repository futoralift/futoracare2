'use client';

import { useState } from 'react';
import { LabReport } from '@/types';
import { getInitials } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Upload, Send, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useLabReports } from '@/hooks/useLabReports';
import { UploadReportModal } from '@/components/modals/UploadReportModal';
import { Skeleton } from '@/components/ui/Skeleton';

function FlagBadge({ flag }: { flag?: string }) {
  if (!flag) return null;
  const isCritical = flag === 'LL' || flag === 'HH';
  return (
    <span
      className="badge"
      style={{
        background: isCritical ? '#fef2f2' : '#fffbeb',
        color: isCritical ? '#dc2626' : '#d97706',
        borderColor: isCritical ? '#fecaca' : '#fde68a',
        fontSize: '0.65rem',
        fontWeight: 700,
      }}
    >
      {flag === 'H' ? '▲ High' : flag === 'L' ? '▼ Low' : flag === 'HH' ? '▲▲ Critically High' : '▼▼ Critically Low'}
    </span>
  );
}

function ReportCard({
  report,
  onDispatch,
  isDispatching,
}: {
  report: LabReport;
  onDispatch: (id: string) => void;
  isDispatching: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    normal: { color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircle size={14} />, label: 'Normal Reference' },
    abnormal: { color: '#d97706', bg: '#fffbeb', icon: <AlertTriangle size={14} />, label: 'Abnormal Biomarkers' },
    critical: { color: '#dc2626', bg: '#fef2f2', icon: <AlertTriangle size={14} />, label: 'Critical Alert' },
  };
  const cfg = statusConfig[report.status];

  return (
    <div className="surface" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Patient Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: '180px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
            {getInitials(report.patientName)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{report.patientName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.testName}</div>
          </div>
        </div>

        {/* Date */}
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', minWidth: '100px' }}>
          {new Date(report.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>

        {/* Status */}
        <span className="badge" style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}33`, gap: '4px' }}>
          {cfg.icon} {cfg.label}
        </span>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          {!report.dispatched ? (
            <button
              className="btn-ghost"
              style={{ fontSize: '0.75rem' }}
              onClick={() => onDispatch(report.id)}
              disabled={isDispatching}
            >
              <Send size={12} /> Dispatch WhatsApp PDF
            </button>
          ) : (
            <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
              ✅ PDF Dispatched
            </span>
          )}
          <button onClick={() => setExpanded(!expanded)} className="btn-ghost" style={{ fontSize: '0.75rem' }}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {expanded ? 'Hide' : 'Review Results'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
          {/* Results Table */}
          <table className="data-table" style={{ fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th>Biomarker / Parameter</th>
                <th>Measured Value</th>
                <th>Unit</th>
                <th>Standard Reference Range</th>
                <th>Clinical Flag</th>
              </tr>
            </thead>
            <tbody>
              {report.results.map((r) => (
                <tr key={r.parameter} style={{ background: r.flag ? '#fff8f0' : 'transparent' }}>
                  <td style={{ fontWeight: 600 }}>{r.parameter}</td>
                  <td style={{ fontWeight: 700, color: r.flag ? (r.flag.includes('H') ? '#dc2626' : '#2563eb') : 'var(--text-primary)' }}>
                    {r.value}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.unit}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.referenceRange}</td>
                  <td><FlagBadge flag={r.flag} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* AI Summary */}
          {report.aiSummary && (
            <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-muted)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>🤖 AI Diagnostic Narrative Synthesis</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{report.aiSummary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ReportsView() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: reports = [], isLoading, dispatchToWhatsApp, isDispatching } = useLabReports();

  const normalCount = reports.filter((r) => r.status === 'normal').length;
  const abnormalCount = reports.filter((r) => r.status === 'abnormal').length;
  const criticalCount = reports.filter((r) => r.status === 'critical').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Reports & Labs AI Summarizer</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>AI-powered clinical lab triage, automatic abnormality flag detection, and WhatsApp PDF dispatch</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Upload size={15} /> Upload Report
        </button>
      </div>

      {/* Status summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Normal Findings', count: normalCount, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Abnormal Flags', count: abnormalCount, color: '#d97706', bg: '#fffbeb' },
          { label: 'Critical Alerts', count: criticalCount, color: '#dc2626', bg: '#fef2f2' },
        ].map((s) => (
          <div key={s.label} className="surface" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="surface" style={{ padding: '1.5rem' }}>
              <Skeleton style={{ width: '40%', height: '20px', marginBottom: '10px' }} />
              <Skeleton style={{ width: '100%', height: '40px' }} />
            </div>
          ))
        ) : reports.length === 0 ? (
          <div className="surface" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>No Lab Reports Registered</div>
            <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Upload a diagnostic panel to begin AI clinical summarization.</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setModalOpen(true)}>
              <Upload size={14} /> Upload Diagnostic Report
            </button>
          </div>
        ) : (
          reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              onDispatch={dispatchToWhatsApp}
              isDispatching={isDispatching}
            />
          ))
        )}
      </div>

      <UploadReportModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
