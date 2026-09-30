'use client';

import { useState } from 'react';
import { WorkflowLog } from '@/types';
import { CheckCircle, XCircle, Loader, Clock, RefreshCw, Zap, X } from 'lucide-react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { TableSkeleton } from '@/components/ui/Skeleton';

function StatusIcon({ status }: { status: WorkflowLog['status'] }) {
  switch (status) {
    case 'success': return <CheckCircle size={16} color="#10b981" />;
    case 'failed': return <XCircle size={16} color="#ef4444" />;
    case 'running': return <Loader size={16} color="#2563eb" style={{ animation: 'spin-slow 1s linear infinite' }} />;
    case 'queued': return <Clock size={16} color="#f59e0b" />;
  }
}

const STATUS_COLORS: Record<WorkflowLog['status'], { bg: string; color: string }> = {
  success: { bg: '#f0fdf4', color: '#16a34a' },
  failed: { bg: '#fef2f2', color: '#dc2626' },
  running: { bg: '#eff6ff', color: '#2563eb' },
  queued: { bg: '#fffbeb', color: '#d97706' },
};

function CreateWorkflowModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { workflowName: string; trigger: string; nodes: number }) => void;
}) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('Scheduled – 24h before appt');
  const [nodes, setNodes] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ workflowName: name, trigger, nodes });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create BullMQ Workflow</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automate reminders, escalations & AI tasks</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Workflow Name *
            </label>
            <input
              className="input-field"
              placeholder="e.g. Teleconsult WhatsApp Link Dispatcher"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Execution Trigger
            </label>
            <select className="input-field" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
              <option>Scheduled – 24h before appt</option>
              <option>Status changed: missed</option>
              <option>Lab result: Critical flag</option>
              <option>Rating ≤ 2 received</option>
              <option>Patient record created</option>
              <option>Cron: Every morning at 8:00 AM</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Orchestration Nodes
            </label>
            <input
              type="number"
              className="input-field"
              value={nodes}
              onChange={(e) => setNodes(parseInt(e.target.value, 10) || 3)}
              min={1}
              max={15}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Deploy Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function WorkflowsView() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: workflows = [], isLoading, rerunWorkflow, createWorkflow, isRerunning } = useWorkflows();

  const successCount = workflows.filter((w) => w.status === 'success').length;
  const runningCount = workflows.filter((w) => w.status === 'running').length;
  const failedCount = workflows.filter((w) => w.status === 'failed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Workflow Engine</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>BullMQ automation — reminders, follow-ups, billing, AI triggers</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Zap size={15} /> Create Workflow
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Executions', value: workflows.length, color: '#2563eb' },
          { label: 'Successful', value: successCount, color: '#10b981' },
          { label: 'Running Now', value: runningCount, color: '#2563eb' },
          { label: 'Failed Jobs', value: failedCount, color: '#ef4444' },
        ].map((s) => (
          <div key={s.label} className="surface" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="surface" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Workflow Pipeline</th>
                <th>Trigger Event</th>
                <th>Execution Time</th>
                <th>Nodes</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                    <Zap size={32} style={{ margin: '0 auto 8px', opacity: 0.35, color: 'var(--primary)' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>No Automated Workflows Configured</div>
                    <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Click &quot;Create Workflow&quot; to configure automated appointment reminders, triage escalations, or follow-ups.</p>
                  </td>
                </tr>
              ) : (
                workflows.map((wf) => {
                  const sc = STATUS_COLORS[wf.status];
                  return (
                    <tr key={wf.id}>
                      <td style={{ fontWeight: 600 }}>{wf.workflowName}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{wf.trigger}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{wf.timestamp}</td>
                      <td>
                        <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                          {wf.nodes} nodes
                        </span>
                      </td>
                      <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}>{wf.duration}</td>
                      <td>
                        <span className="badge" style={{ background: sc.bg, color: sc.color, borderColor: `${sc.color}33`, gap: '5px' }}>
                          <StatusIcon status={wf.status} />
                          {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => rerunWorkflow(wf.id)}
                          disabled={isRerunning}
                          title="Re-run workflow on BullMQ"
                          style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                        >
                          <RefreshCw size={12} /> Re-run
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <CreateWorkflowModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(data) => createWorkflow(data)}
      />
    </div>
  );
}
