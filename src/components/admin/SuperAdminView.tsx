'use client';

import { useState, useEffect } from 'react';
import { Tenant, Subscription, SuperAdminMetrics, StaffMember } from '@/types';
import {
  Building2, CreditCard, TrendingUp, Activity, Bed, Eye,
  Search, Shield, BarChart3, Lock, LogOut, KeyRound,
  Calendar, Clock, Phone, Mail, CheckCircle2, AlertTriangle,
  ExternalLink, Stethoscope, UserCheck, RefreshCw, X, Sparkles,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { toast } from '@/store/toastStore';

interface HospitalRow extends Tenant {
  subscription: Subscription | null;
  staffCount?: number;
  staffMembers?: StaffMember[];
  monthlyRevenue: number;
  totalRevenue: number;
}

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  trial: '#f59e0b',
  suspended: '#ef4444',
  cancelled: '#94a3b8',
};

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  starter:    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  growth:     { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  enterprise: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
};

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
};

/**
 * Calculates accurate days remaining in subscription or trial.
 */
function getSubscriptionCountdown(sub: Subscription | null, tenantCreatedAt: string) {
  const now = new Date();

  if (!sub) {
    return {
      isTrial: true,
      daysRemaining: 7,
      label: 'Trial (7 Days Left)',
      badgeColor: '#b45309',
      badgeBg: '#fef3c7',
      expiryDate: '–',
      statusText: '7-Day Free Trial',
    };
  }

  const isTrial = sub.isTrial || sub.status === 'trial';

  if (isTrial) {
    let endDate: Date;
    if (sub.trialEndsAt) {
      endDate = new Date(sub.trialEndsAt);
    } else {
      const start = new Date(sub.startDate || tenantCreatedAt);
      endDate = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const expiryDateStr = endDate.toISOString().split('T')[0];

    if (diffDays <= 0) {
      return {
        isTrial: true,
        daysRemaining: 0,
        label: 'Trial Expired',
        badgeColor: '#dc2626',
        badgeBg: '#fee2e2',
        expiryDate: expiryDateStr,
        statusText: 'Trial Expired',
      };
    }

    return {
      isTrial: true,
      daysRemaining: diffDays,
      label: `${diffDays} Day${diffDays > 1 ? 's' : ''} Left in Trial`,
      badgeColor: '#b45309',
      badgeBg: '#fef3c7',
      expiryDate: expiryDateStr,
      statusText: '7-Day Free Trial',
    };
  }

  // Active Paid Subscription
  if (sub.nextRenewal) {
    const renewalDate = new Date(sub.nextRenewal);
    const diffMs = renewalDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const renewalDateStr = renewalDate.toISOString().split('T')[0];

    if (diffDays <= 0) {
      return {
        isTrial: false,
        daysRemaining: 0,
        label: 'Renewal Due',
        badgeColor: '#d97706',
        badgeBg: '#fef3c7',
        expiryDate: renewalDateStr,
        statusText: 'Renewal Due Today',
      };
    }

    return {
      isTrial: false,
      daysRemaining: diffDays,
      label: `Renews in ${diffDays}d`,
      badgeColor: '#15803d',
      badgeBg: '#dcfce7',
      expiryDate: renewalDateStr,
      statusText: 'Active Paid Subscription',
    };
  }

  return {
    isTrial: false,
    daysRemaining: 30,
    label: 'Active Paid',
    badgeColor: '#15803d',
    badgeBg: '#dcfce7',
    expiryDate: 'Monthly Auto-Renewal',
    statusText: 'Active Paid Subscription',
  };
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      className="stat-card"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.25rem',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          flexShrink: 0,
          background: color ? `${color}18` : 'var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color ?? 'var(--primary)',
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
      </div>
    </div>
  );
}

export function SuperAdminView() {
  const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
  const [metrics, setMetrics] = useState<SuperAdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [selected, setSelected] = useState<HospitalRow | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { activeUser, logout, setActiveTenantId, setActiveView } = useUIStore();
  const isAuthorized = activeUser?.role === 'super_admin' && activeUser?.email === 'madhur@futoragroup.com';

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/superadmin/hospitals').then((r) => r.json()),
      fetch('/api/superadmin/metrics').then((r) => r.json()),
    ])
      .then(([h, m]) => {
        setHospitals(h.data ?? []);
        setMetrics(m.data ?? null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!isAuthorized) return;
    loadData();
  }, [isAuthorized]);

  const handleExtendTrial = async (hospitalId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/superadmin/hospitals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, extendDays: 7 }),
      });
      if (!res.ok) throw new Error('Failed to extend trial');
      toast.success('Trial Extended', 'Added +7 days to the free trial period.');
      loadData();
      if (selected && selected.id === hospitalId) {
        setSelected(null);
      }
    } catch (_err) {
      toast.error('Update Failed', 'Could not extend trial period.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (hospitalId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' || currentStatus === 'trial' ? 'suspended' : 'active';
    setIsUpdating(true);
    try {
      const res = await fetch('/api/superadmin/hospitals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success('Hospital Status Updated', `Status changed to ${newStatus}.`);
      loadData();
      if (selected && selected.id === hospitalId) {
        setSelected((prev) => (prev ? { ...prev, status: newStatus as Tenant['status'] } : null));
      }
    } catch (_err) {
      toast.error('Update Failed', 'Could not update hospital status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImpersonate = (hospital: HospitalRow) => {
    setActiveTenantId(hospital.id);
    setActiveView('dashboard');
    toast.success('Switched Workspace', `Viewing ${hospital.name} live console.`);
  };

  if (!isAuthorized) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.05))',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 24px -4px rgba(239, 68, 68, 0.2)',
          }}
        >
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Restricted Platform Gateway
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          This console is strictly password-protected and accessible only to the Super Administrator (<strong>madhur@futoragroup.com</strong>).
        </p>
        <a
          href="/admin-portal"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '0.75rem 1.5rem' }}
        >
          <KeyRound size={16} /> Authenticate via Secret Admin Portal
        </a>
      </div>
    );
  }

  const filtered = hospitals.filter((h) => {
    const matchSearch =
      !search ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()) ||
      h.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.owner?.email?.toLowerCase().includes(search.toLowerCase()) ||
      h.owner?.phone?.includes(search);
    const matchStatus = filterStatus === 'all' || h.status === filterStatus;
    const matchPlan = filterPlan === 'all' || h.plan === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <Activity size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '0.75rem', fontSize: '0.9375rem' }}>Loading Super Admin Console…</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Shield size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Super Admin Console
            </h1>
            <span
              className="badge"
              style={{
                background: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              🔒 Master: madhur@futoragroup.com
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Hospital client directory, subscription oversight, trial countdowns, and business intelligence.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={loadData}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Refresh Directory"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s',
            }}
          >
            <LogOut size={15} /> Lock &amp; Sign Out
          </button>
        </div>
      </div>

      {/* Platform SaaS Metrics (Hospital & Subscription focused) */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <MetricCard
            icon={<Building2 size={20} />}
            label="Total Hospitals"
            value={metrics.totalHospitals}
            sub="Registered on platform"
            color="#2563eb"
          />
          <MetricCard
            icon={<CreditCard size={20} />}
            label="Active Subscriptions"
            value={metrics.activeSubscriptions}
            sub="Paid recurring accounts"
            color="#10b981"
          />
          <MetricCard
            icon={<Clock size={20} />}
            label="Active Free Trials"
            value={metrics.trialAccounts}
            sub="7-day trial accounts"
            color="#f59e0b"
          />
          <MetricCard
            icon={<TrendingUp size={20} />}
            label="Monthly Revenue"
            value={`₹${metrics.totalMRR.toLocaleString('en-IN')}`}
            sub="Active recurring MRR"
            color="#8b5cf6"
          />
          <MetricCard
            icon={<BarChart3 size={20} />}
            label="Total Collected"
            value={`₹${(metrics.totalRevenueCollected ?? 0).toLocaleString('en-IN')}`}
            sub="All-time platform payments"
            color="#06b6d4"
          />
          <MetricCard
            icon={<Bed size={20} />}
            label="Network Capacity"
            value={`${metrics.totalBeds.toLocaleString()} Beds`}
            sub={`${metrics.totalDoctors.toLocaleString()} Doctors across clients`}
            color="#ec4899"
          />
        </div>
      )}

      {/* Hospital Directory Table */}
      <div className="surface" style={{ overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', flex: 1 }}>
            Registered Hospital Clients ({filtered.length})
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              className="input-field"
              style={{ paddingLeft: '30px', width: '220px' }}
              placeholder="Search hospitals or owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active (Paid)</option>
            <option value="trial">Free Trial</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Plan Filter */}
          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {[
                  'Hospital & Campus',
                  'Owner / Decision Maker',
                  'Plan Tier',
                  'Subscription Status',
                  'Days Remaining',
                  'Purchased On',
                  'Cycle Fee',
                  'Total Paid',
                  'Action',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => {
                const planMeta = PLAN_COLORS[h.plan] ?? { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
                const countdown = getSubscriptionCountdown(h.subscription, h.createdAt);

                return (
                  <tr
                    key={h.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                    onClick={() => setSelected(h)}
                  >
                    {/* Hospital Name & Location */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{h.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span>{h.city}</span>
                        {h.branch && <span>• {h.branch}</span>}
                      </div>
                    </td>

                    {/* Owner Details */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {h.owner?.name || '–'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {h.owner?.designation || 'Owner'} {h.owner?.phone ? `• ${h.owner.phone}` : ''}
                      </div>
                    </td>

                    {/* Plan */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 9px',
                          borderRadius: '99px',
                          background: planMeta.bg,
                          color: planMeta.text,
                          border: `1px solid ${planMeta.border}`,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {PLAN_LABELS[h.plan] ?? h.plan}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: STATUS_COLORS[h.status] ?? '#94a3b8',
                        }}
                      >
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: STATUS_COLORS[h.status] ?? '#94a3b8',
                          }}
                        />
                        {countdown.statusText}
                      </span>
                    </td>

                    {/* Days Remaining / Expiry */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: countdown.badgeColor,
                          background: countdown.badgeBg,
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        <Clock size={11} /> {countdown.label}
                      </span>
                    </td>

                    {/* Purchased On */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {h.createdAt || h.subscription?.startDate || '–'}
                    </td>

                    {/* Fee / MRR */}
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      ₹{(h.monthlyRevenue ?? 0).toLocaleString('en-IN')}/mo
                    </td>

                    {/* Total Revenue Paid */}
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem', color: '#16a34a' }}>
                      ₹{(h.totalRevenue ?? 0).toLocaleString('en-IN')}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button
                        className="btn-ghost"
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(h);
                        }}
                      >
                        <Eye size={13} /> View All
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <Building2 size={24} />
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No Hospitals Registered Yet
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      When hospital owners complete the onboarding process, their complete profile and subscription will appear here.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospital Details Slide-Over Drawer */}
      {selected && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'flex-end',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'var(--bg-surface)',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              animation: 'slideIn 0.2s ease',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                background: 'var(--bg-elevated)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Building2 size={18} color="var(--primary)" />
                  <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                    {selected.name}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {selected.city} • {selected.branch || 'Main Branch'}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  border: 'none',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '6px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* 1. Subscription & Days Remaining Countdown Box */}
              {(() => {
                const countdown = getSubscriptionCountdown(selected.subscription, selected.createdAt);
                const sub = selected.subscription;

                return (
                  <div
                    style={{
                      background: countdown.badgeBg,
                      border: `1px solid ${countdown.badgeColor}33`,
                      borderRadius: '14px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: countdown.badgeColor,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {countdown.statusText}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 800,
                          color: countdown.badgeColor,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Clock size={14} /> {countdown.label}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '4px' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>PURCHASED / STARTED</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                          {selected.createdAt || sub?.startDate || '–'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                          {countdown.isTrial ? 'FREE TRIAL EXPIRES' : 'NEXT BILLING RENEWAL'}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                          {countdown.expiryDate}
                        </div>
                      </div>
                    </div>

                    {sub && (
                      <div
                        style={{
                          borderTop: '1px dashed rgba(0,0,0,0.1)',
                          paddingTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          color: '#475569',
                        }}
                      >
                        <span>
                          Autopay Mandate:{' '}
                          <strong>{sub.autopayEnabled ? `Active (${sub.autopayMethod?.toUpperCase() || 'UPI'})` : 'None'}</strong>
                        </span>
                        <span>
                          Cycle: <strong>{sub.billingCycle || 'Monthly'}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 2. Onboarded Owner & Decision Maker Details */}
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                    marginBottom: '0.75rem',
                  }}
                >
                  Hospital Owner &amp; Decision Maker
                </div>
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.875rem',
                      }}
                    >
                      {selected.owner?.name?.slice(0, 2).toUpperCase() || 'MD'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {selected.owner?.name || 'Not Specified'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {selected.owner?.designation || 'Managing Director'}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.625rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selected.owner?.email && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={13} /> Email:
                        </span>
                        <a href={`mailto:${selected.owner.email}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                          {selected.owner.email}
                        </a>
                      </div>
                    )}
                    {selected.owner?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} /> Phone:
                        </span>
                        <a href={`tel:${selected.owner.phone}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                          {selected.owner.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Physical Infrastructure & Capacity Profile */}
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                    marginBottom: '0.75rem',
                  }}
                >
                  Hospital Infrastructure (Onboarding Specs)
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                  }}
                >
                  <div style={{ padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>BEDS REGISTERED</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {selected.beds} Beds
                    </div>
                  </div>
                  <div style={{ padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>DOCTORS ON STAFF</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {selected.doctors} Doctors
                    </div>
                  </div>
                  <div style={{ padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>CITY &amp; STATE</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {selected.city}
                    </div>
                  </div>
                  <div style={{ padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>TENANT ID</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-all' }}>
                      {selected.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Financial & Revenue Breakdown */}
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                    marginBottom: '0.75rem',
                  }}
                >
                  Commercials &amp; Billing
                </div>
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subscription Plan:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{PLAN_LABELS[selected.plan] ?? selected.plan}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Recurring Cycle Fee:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{(selected.monthlyRevenue ?? 0).toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Platform Revenue Received:</span>
                    <span style={{ fontWeight: 800, color: '#16a34a' }}>₹{(selected.totalRevenue ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* 5. Super Admin Action Controls */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleExtendTrial(selected.id)}
                    className="btn-ghost"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      fontSize: '0.8125rem',
                      padding: '9px 12px',
                      borderRadius: '10px',
                    }}
                  >
                    <Clock size={14} /> Extend Trial (+7d)
                  </button>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleToggleStatus(selected.id, selected.status)}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      fontSize: '0.8125rem',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      background: selected.status === 'suspended' ? '#f0fdf4' : '#fef2f2',
                      color: selected.status === 'suspended' ? '#16a34a' : '#dc2626',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {selected.status === 'suspended' ? 'Activate Hospital' : 'Suspend Access'}
                  </button>
                </div>

                <button
                  onClick={() => handleImpersonate(selected)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: 700,
                  }}
                >
                  <ExternalLink size={15} /> Enter {selected.name} Console
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
