'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Save, Webhook, Bot, Mic, Building2, ShieldCheck } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useTenants } from '@/hooks/useTenants';

export function SettingsView() {
  const { activeTenantId, setActiveTenantId } = useUIStore();
  const { data: settings, updateSettings, isSaving } = useSettings();
  const { tenants = [] } = useTenants();

  const [localOverrides, setLocalOverrides] = useState<{
    llmModel?: string;
    whatsappPersona?: string;
    voiceAccent?: string;
    voiceProvider?: string;
    webhookUrl?: string;
    webhookSecret?: string;
    autoApologyEnabled?: boolean;
    emergencyEscalation?: boolean;
  }>({});

  const llmModel = localOverrides.llmModel ?? settings?.llmModel ?? 'gemini-1.5-pro';
  const whatsappPersona = localOverrides.whatsappPersona ?? settings?.whatsappPersona ?? 'Futoracare AI Assistant — friendly, professional healthcare tone';
  const voiceAccent = localOverrides.voiceAccent ?? settings?.voiceAccent ?? 'en-IN-female';
  const voiceProvider = localOverrides.voiceProvider ?? settings?.voiceProvider ?? 'Twilio Voice';
  const webhookUrl = localOverrides.webhookUrl ?? settings?.webhookUrl ?? 'https://your-hospital.com/webhooks/futoracare';
  const webhookSecret = localOverrides.webhookSecret ?? settings?.webhookSecret ?? 'whk_futoracare_secret_key_xxxx';
  const autoApologyEnabled = localOverrides.autoApologyEnabled ?? settings?.autoApologyEnabled ?? true;
  const emergencyEscalation = localOverrides.emergencyEscalation ?? settings?.emergencyEscalation ?? true;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      llmModel,
      whatsappPersona,
      voiceAccent,
      voiceProvider,
      webhookUrl,
      webhookSecret,
      autoApologyEnabled,
      emergencyEscalation,
    });
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Settings & Integrations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>Tenant configuration, AI inference engines, and security webhooks</p>
      </div>

      {/* Tenant Selector */}
      <div className="surface" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <Building2 size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Active Multi-Tenant Hospital Branch</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {tenants.map((t) => (
            <label
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                border: `2px solid ${activeTenantId === t.id ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                background: activeTenantId === t.id ? 'var(--primary-light)' : 'var(--bg-elevated)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="radio"
                  name="tenant"
                  checked={activeTenantId === t.id}
                  onChange={() => setActiveTenantId(t.id)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.branch} • {t.beds} beds • {t.doctors} doctors</div>
                </div>
              </div>
              <span className="badge" style={{
                background: t.plan === 'enterprise' ? '#eff6ff' : t.plan === 'growth' ? '#f0fdf4' : '#f8fafc',
                color: t.plan === 'enterprise' ? '#2563eb' : t.plan === 'growth' ? '#16a34a' : '#64748b',
                border: '1px solid var(--border)',
                textTransform: 'capitalize',
              }}>
                {t.plan}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* AI Model Configuration */}
      <div className="surface" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <Bot size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>AI Model Configuration</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Primary Inference LLM</label>
            <select
              value={llmModel}
              onChange={(e) => setLocalOverrides((prev) => ({ ...prev, llmModel: e.target.value }))}
              className="input-field"
              style={{ maxWidth: '340px' }}
            >
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended for Clinical Triage)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Low Latency)</option>
              <option value="gpt-4o">GPT-4o (OpenAI)</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>WhatsApp AI Clinical Tone</label>
            <input
              className="input-field"
              value={whatsappPersona}
              onChange={(e) => setLocalOverrides((prev) => ({ ...prev, whatsappPersona: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Voice Call Settings */}
      <div className="surface" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <Mic size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Voice Call & Telephony</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Voice Accent & Gender</label>
            <select value={voiceAccent} onChange={(e) => setLocalOverrides((prev) => ({ ...prev, voiceAccent: e.target.value }))} className="input-field">
              <option value="en-IN-female">English (India) — Female Natural</option>
              <option value="en-IN-male">English (India) — Male Formal</option>
              <option value="hi-IN-female">Hindi (India) — Female Warm</option>
              <option value="hi-IN-male">Hindi (India) — Male Support</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Telephony Gateway Provider</label>
            <select value={voiceProvider} onChange={(e) => setLocalOverrides((prev) => ({ ...prev, voiceProvider: e.target.value }))} className="input-field">
              <option value="Twilio Voice">Twilio Voice Cloud</option>
              <option value="Exotel (India)">Exotel (India Regional Gateway)</option>
              <option value="Google Cloud TTS">Google Cloud Text-to-Speech</option>
            </select>
          </div>
        </div>
      </div>

      {/* Safety & Automations */}
      <div className="surface" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Clinical Safety & Automated Dispatches</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={autoApologyEnabled}
              onChange={(e) => setLocalOverrides((prev) => ({ ...prev, autoApologyEnabled: e.target.checked }))}
              style={{ accentColor: 'var(--primary)' }}
            />
            <span>Auto-dispatch apology WhatsApp message when CSAT rating ≤ 2</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={emergencyEscalation}
              onChange={(e) => setLocalOverrides((prev) => ({ ...prev, emergencyEscalation: e.target.checked }))}
              style={{ accentColor: 'var(--primary)' }}
            />
            <span>Instant emergency routing on clinical keywords (Chest pain, breathing distress)</span>
          </label>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="surface" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <Webhook size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>HIS / EHR Webhook Integration</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Webhook Endpoint URL</label>
            <input className="input-field" value={webhookUrl} onChange={(e) => setLocalOverrides((prev) => ({ ...prev, webhookUrl: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>HMAC Secret Token</label>
            <input className="input-field" type="password" value={webhookSecret} onChange={(e) => setLocalOverrides((prev) => ({ ...prev, webhookSecret: e.target.value }))} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn-primary" style={{ padding: '0.625rem 1.5rem' }} disabled={isSaving}>
          <Save size={15} /> {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
