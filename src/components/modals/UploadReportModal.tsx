'use client';

import { useState } from 'react';
import { X, FileUp, Sparkles, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { LabResult } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadReportModal({ isOpen, onClose, onSuccess }: Props) {
  const [patientName, setPatientName] = useState('');
  const [testName, setTestName] = useState('Comprehensive Metabolic Panel');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState<LabResult[]>([
    { parameter: 'Fasting Glucose', value: '142', unit: 'mg/dL', referenceRange: '70–100', flag: 'H' },
    { parameter: 'HbA1c', value: '7.4', unit: '%', referenceRange: '< 5.7', flag: 'H' },
    { parameter: 'Serum Creatinine', value: '1.0', unit: 'mg/dL', referenceRange: '0.7–1.2' },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddParam = () => {
    setResults([
      ...results,
      { parameter: '', value: '', unit: '', referenceRange: '' },
    ]);
  };

  const handleRemoveParam = (index: number) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const handleUpdateParam = (index: number, field: keyof LabResult, val: string) => {
    const updated = [...results];
    updated[index] = { ...updated[index], [field]: val };
    setResults(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || results.length === 0) {
      toast.error('Validation Error', 'Please enter patient name and at least one test parameter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          testName,
          date,
          results,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload report');
      }

      toast.success('Report Analyzed & Uploaded', `AI clinical summary generated for ${patientName}`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error('Upload Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <FileUp size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Upload Diagnostic Lab Report</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI parameter extraction and clinical summarizer</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Patient Name *
              </label>
              <input
                className="input-field"
                placeholder="e.g. Suresh Patel"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Report Date
              </label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Test Panel Name
            </label>
            <input
              className="input-field"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. Lipid Profile, Complete Blood Count"
              required
            />
          </div>

          {/* Parameters Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Test Parameters & Results
              </label>
              <button
                type="button"
                onClick={handleAddParam}
                className="btn-ghost"
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                <Plus size={12} /> Add Parameter
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {results.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.5fr 1fr auto', gap: '6px', alignItems: 'center' }}>
                  <input
                    className="input-field"
                    placeholder="Parameter"
                    value={r.parameter}
                    onChange={(e) => handleUpdateParam(i, 'parameter', e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '4px 6px' }}
                    required
                  />
                  <input
                    className="input-field"
                    placeholder="Value"
                    value={r.value}
                    onChange={(e) => handleUpdateParam(i, 'value', e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '4px 6px' }}
                    required
                  />
                  <input
                    className="input-field"
                    placeholder="Unit"
                    value={r.unit}
                    onChange={(e) => handleUpdateParam(i, 'unit', e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '4px 6px' }}
                  />
                  <input
                    className="input-field"
                    placeholder="Ref Range"
                    value={r.referenceRange}
                    onChange={(e) => handleUpdateParam(i, 'referenceRange', e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '4px 6px' }}
                  />
                  <select
                    className="input-field"
                    value={r.flag || ''}
                    onChange={(e) => handleUpdateParam(i, 'flag', e.target.value as 'L' | 'H' | 'LL' | 'HH')}
                    style={{ fontSize: '0.78rem', padding: '4px 6px' }}
                  >
                    <option value="">Normal</option>
                    <option value="H">High (H)</option>
                    <option value="L">Low (L)</option>
                    <option value="HH">Critical High (HH)</option>
                    <option value="LL">Critical Low (LL)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveParam(i)}
                    style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--primary-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>
              AI will automatically synthesize a diagnostic clinical narrative and flag abnormal biomarkers.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Analyzing...' : 'Upload & Generate AI Summary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
