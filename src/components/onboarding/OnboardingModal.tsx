'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '@/store/uiStore';
import { SubscriptionPlan, BillingCycle, PaymentMethod, PLAN_PRICES, PLAN_LABELS } from '@/types';
import {
  X, CheckCircle2, CreditCard, Smartphone, Landmark, Building2,
  User, Phone, Mail, MapPin, Bed, Stethoscope, ArrowRight, ArrowLeft, Loader2, Lock,
} from 'lucide-react';
import { StaffRosterModal } from './StaffRosterModal';

type Step = 'plan' | 'hospital' | 'owner' | 'payment' | 'confirm';

interface Props {
  initialPlan?: SubscriptionPlan;
  billingCycle?: BillingCycle;
  onClose: () => void;
}

const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  starter:    ['Up to 15 Doctors & 50 Beds', '24/7 WhatsApp AI Assistant', '500 AI Voice Calls/mo', 'Standard Analytics', 'Email Support'],
  growth:     ['Up to 75 Doctors & 250 Beds', 'Unlimited WhatsApp AI', '5,000 AI Voice Calls/mo', 'Lab AI Summarizer', 'Priority SLA Support'],
  enterprise: ['Unlimited Doctors & Multi-Branch', 'PostgreSQL RLS Isolation', 'Unlimited Voice & WhatsApp', 'Custom Clinical LLM', 'Dedicated TAM'],
};

export function OnboardingModal({ initialPlan = 'growth', billingCycle: initBillingCycle = 'monthly', onClose }: Props) {
  const { loginAs, startTrial } = useUIStore();


  const [step, setStep] = useState<Step>('plan');
  const [isTrial, setIsTrial] = useState<boolean>(true); // Default to 7-Day Free Trial
  const [plan, setPlan] = useState<SubscriptionPlan>(initialPlan);
  const [billing, setBilling] = useState<BillingCycle>(initBillingCycle);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<{
    tenant: { id: string; name: string };
    ownerStaffMember: { id: string; name: string; email: string; phone: string; role: string; isActive: boolean; createdAt: string; tenantId: string; avatarInitials?: string };
  } | null>(null);
  const [showStaffRoster, setShowStaffRoster] = useState(false);

  const [hospital, setHospital] = useState({ name: '', branch: '', city: '', beds: 100, doctors: 30 });
  const [owner, setOwner] = useState({ name: '', email: '', phone: '', designation: 'Managing Director' });
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const price = PLAN_PRICES[plan][billing];
  const total = billing === 'annual' ? price * 12 : price;

  function validateHospital() {
    const e: Record<string, string> = {};
    if (!hospital.name || hospital.name.length < 3) e.name = 'Hospital name must be at least 3 characters';
    if (!hospital.branch || hospital.branch.length < 3) e.branch = 'Branch/location required';
    if (!hospital.city || hospital.city.length < 2) e.city = 'City required';
    if (hospital.beds < 1) e.beds = 'At least 1 bed required';
    if (hospital.doctors < 1) e.doctors = 'At least 1 doctor required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateOwner() {
    const e: Record<string, string> = {};
    if (!owner.name || owner.name.length < 3) e.name = 'Owner name required';
    if (!owner.email || !owner.email.includes('@')) e.email = 'Valid email required';
    if (!owner.phone || owner.phone.length < 10) e.phone = 'Valid phone number required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCheckout() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/onboarding/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalName: hospital.name, branch: hospital.branch, city: hospital.city,
          beds: hospital.beds, doctors: hospital.doctors,
          ownerName: owner.name, ownerEmail: owner.email, ownerPhone: owner.phone,
          ownerDesignation: owner.designation, plan, billingCycle: billing, paymentMethod,
          isTrial,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      setCheckoutResult(data.data);
      setStep('confirm');
    } catch (e) {
      setErrors({ checkout: e instanceof Error ? e.message : 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  function enterPortal() {
    if (!checkoutResult) return;
    const staff = checkoutResult.ownerStaffMember;
    if (isTrial) {
      startTrial({ ...staff, role: 'hospital_owner' as const }, checkoutResult.tenant.id, plan);
    } else {
      loginAs({ ...staff, role: 'hospital_owner' as const }, checkoutResult.tenant.id, true, false, plan);
    }
    onClose();
  }

  const STEPS: Step[] = ['plan', 'hospital', 'owner', 'payment', 'confirm'];
  const stepIdx = STEPS.indexOf(step);

  // ── Step body content ──────────────────────────────────────────────────────
  const stepBody = (
    <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>

      {/* STEP 1: Plan */}
      {step === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Trial vs Paid Toggle */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Select Onboarding Mode
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                onClick={() => setIsTrial(true)}
                style={{
                  border: `2px solid ${isTrial ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '10px', padding: '10px 12px', cursor: 'pointer',
                  background: isTrial ? 'var(--primary-light)' : 'var(--bg-elevated)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: isTrial ? 'var(--primary)' : 'var(--text-primary)' }}>
                  🌟 7-Day Free Trial
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  ₹0 Today • Monthly Autopay on Day 7
                </div>
              </div>
              <div
                onClick={() => setIsTrial(false)}
                style={{
                  border: `2px solid ${!isTrial ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '10px', padding: '10px 12px', cursor: 'pointer',
                  background: !isTrial ? 'var(--primary-light)' : 'var(--bg-elevated)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: !isTrial ? 'var(--primary)' : 'var(--text-primary)' }}>
                  ⚡ Pay &amp; Unlock Instantly
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Immediate full access + WhatsApp AI
                </div>
              </div>
            </div>
          </div>

          {/* Trial Disclaimer Banner */}
          {isTrial && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 12px', fontSize: '0.75rem', color: '#92400e', lineHeight: 1.45 }}>
              <strong>🔒 Note on 7-Day Free Trial:</strong> Automated WhatsApp AI messaging is <strong>locked</strong> during the trial period to prevent gateway misuse. EHR, Appointments, Voice Simulator, Lab AI &amp; Analytics are fully active. <strong>Screen locks automatically at the end of Day 7</strong> until monthly payment is authorized.
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Choose Tier</div>
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
                {(['monthly', 'annual'] as BillingCycle[]).map((b) => (
                  <button key={b} onClick={() => setBilling(b)} style={{ border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: billing === b ? 'var(--primary)' : 'transparent', color: billing === b ? 'white' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                    {b === 'monthly' ? 'Monthly' : 'Annual (−20%)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(['starter', 'growth', 'enterprise'] as SubscriptionPlan[]).map((p) => (
            <div key={p} onClick={() => setPlan(p)} style={{ border: `2px solid ${plan === p ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '12px', padding: '1rem', cursor: 'pointer', background: plan === p ? 'var(--primary-light)' : 'var(--bg-elevated)', transition: 'all 0.15s', position: 'relative' }}>
              {p === 'growth' && <span style={{ position: 'absolute', top: '-10px', right: '12px', background: 'var(--primary)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 10px', borderRadius: '99px', textTransform: 'uppercase' }}>Popular</span>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{PLAN_LABELS[p]}</div>
                <div style={{ fontWeight: 800, color: plan === p ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {isTrial ? (
                    <span><span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>₹0 Today</span> • ₹{PLAN_PRICES[p][billing].toLocaleString('en-IN')}/<span style={{ fontSize: '0.75rem', fontWeight: 500 }}>mo after trial</span></span>
                  ) : (
                    <span>₹{PLAN_PRICES[p][billing].toLocaleString('en-IN')}/<span style={{ fontSize: '0.75rem', fontWeight: 500 }}>mo</span></span>
                  )}
                </div>
              </div>
              {PLAN_FEATURES[p].slice(0, 3).map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <CheckCircle2 size={13} color="#10b981" /> {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* STEP 2: Hospital */}
      {step === 'hospital' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Hospital Details</div>
          {[
            { key: 'name', label: 'Hospital / Clinic Name', placeholder: 'e.g. Shree Ram Multi-Specialty Hospital', icon: <Building2 size={15} /> },
            { key: 'branch', label: 'Branch / Location', placeholder: 'e.g. Jubilee Hills Branch, Hyderabad', icon: <MapPin size={15} /> },
            { key: 'city', label: 'City', placeholder: 'e.g. Hyderabad', icon: <MapPin size={15} /> },
          ].map(({ key, label, placeholder, icon }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>
                <input className="input-field" style={{ paddingLeft: '32px' }} placeholder={placeholder} value={(hospital as Record<string, string | number>)[key] as string} onChange={(e) => setHospital({ ...hospital, [key]: e.target.value })} />
              </div>
              {errors[key] && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors[key]}</div>}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Number of Beds</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Bed size={15} /></span>
                <input className="input-field" style={{ paddingLeft: '32px' }} type="number" min={1} value={hospital.beds} onChange={(e) => setHospital({ ...hospital, beds: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Number of Doctors</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Stethoscope size={15} /></span>
                <input className="input-field" style={{ paddingLeft: '32px' }} type="number" min={1} value={hospital.doctors} onChange={(e) => setHospital({ ...hospital, doctors: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Owner */}
      {step === 'owner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Owner / Administrator Details</div>
          {[
            { key: 'name', label: 'Full Name', placeholder: 'e.g. Rajesh Gupta', icon: <User size={15} /> },
            { key: 'email', label: 'Work Email', placeholder: 'e.g. rajesh@hospital.com', icon: <Mail size={15} /> },
            { key: 'phone', label: 'Phone Number', placeholder: 'e.g. +91 98765 43210', icon: <Phone size={15} /> },
            { key: 'designation', label: 'Designation', placeholder: 'e.g. Managing Director', icon: <User size={15} /> },
          ].map(({ key, label, placeholder, icon }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>
                <input className="input-field" style={{ paddingLeft: '32px' }} placeholder={placeholder} value={(owner as Record<string, string>)[key]} onChange={(e) => setOwner({ ...owner, [key]: e.target.value })} />
              </div>
              {errors[key] && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors[key]}</div>}
            </div>
          ))}
        </div>
      )}

      {/* STEP 4: Payment / Autopay Mandate */}
      {step === 'payment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {isTrial ? 'Authorize Recurring Autopay (7-Day Trial)' : 'Confirm & Complete Payment'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isTrial
                ? '₹0 charged today. Recurring monthly autopay triggers at the end of Day 7.'
                : 'Instant one-time charge with full feature unlock.'}
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              {isTrial ? 'Trial & Mandate Summary' : 'Order Summary'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Selected Plan</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{PLAN_LABELS[plan]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Billing Frequency</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>Monthly Recurring Autopay</span>
            </div>
            {isTrial && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.875rem', color: '#10b981' }}>Free Trial Duration</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>7 Days (EHR + Vitals + Labs)</span>
              </div>
            )}
            {isTrial && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.875rem', color: '#f59e0b' }}>Autonomous WhatsApp AI</span>
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>🔒 Locked in Trial</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Monthly Autopay Debit (Post-Trial)</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{price.toLocaleString('en-IN')}/mo</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Total Due Today</span>
              <span style={{ fontWeight: 900, fontSize: '1.35rem', color: isTrial ? '#10b981' : 'var(--primary)' }}>
                {isTrial ? '₹0 (Free Trial)' : `₹${total.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>

          {/* Autopay Mandate Method */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              {isTrial ? 'Autopay Authorization Method (UPI / NetBanking / Card Mandate)' : 'Payment Method'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {([
                { id: 'upi', label: 'UPI Autopay (GPay / PhonePe / Paytm Mandate)', icon: <Smartphone size={18} /> },
                { id: 'netbanking', label: 'Net Banking e-Mandate (e-NACH)', icon: <Landmark size={18} /> },
                { id: 'card', label: 'Credit / Debit Card Recurring Standing Instruction', icon: <CreditCard size={18} /> },
              ] as { id: PaymentMethod; label: string; icon: React.ReactNode }[]).map((m) => (
                <div key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ border: `2px solid ${paymentMethod === m.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '10px', padding: '0.875rem 1rem', cursor: 'pointer', background: paymentMethod === m.id ? 'var(--primary-light)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.15s' }}>
                  <span style={{ color: paymentMethod === m.id ? 'var(--primary)' : 'var(--text-muted)' }}>{m.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{m.label}</span>
                  {paymentMethod === m.id && <CheckCircle2 size={16} color="var(--primary)" style={{ marginLeft: 'auto' }} />}
                </div>
              ))}
            </div>
            {paymentMethod === 'upi' && (
              <div style={{ marginTop: '0.75rem' }}>
                <input className="input-field" placeholder="Enter VPA / UPI ID for Autopay (e.g. rajesh@okaxis)" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
              </div>
            )}
          </div>

          {/* Mandate Lock Terms */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>🔒 Autopay &amp; Screen Lock Agreement</div>
            • Day 1 to 7: Full access to EHR &amp; Lab AI. WhatsApp automated replies remain locked.<br />
            • Day 7: Recurring monthly payment of ₹{price.toLocaleString('en-IN')} is auto-debited. If payment fails or is revoked, <strong>the portal screen is immediately locked</strong> until payment is completed.<br />
            • RBI e-Mandate notifications will be dispatched 24 hours prior to recurring debit.
          </div>

          {errors.checkout && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem', color: '#dc2626', fontSize: '0.8125rem' }}>{errors.checkout}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Lock size={12} /> Compliant with RBI e-Mandate &amp; NPCI UPI Autopay circulars.
          </div>
        </div>
      )}

      {/* STEP 5: Confirm */}
      {step === 'confirm' && checkoutResult && (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {isTrial ? '7-Day Free Trial Activated!' : `${hospital.name} is Live!`}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {isTrial
              ? `Your 7-day trial for ${PLAN_LABELS[plan]} is active. Set up your staff roster below to assign roles and module permissions.`
              : `Your ${PLAN_LABELS[plan]} subscription is active. Now set up your team — assign roles and module access.`}
          </div>

          {isTrial && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.875rem', marginBottom: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: '#92400e' }}>
              <div style={{ fontWeight: 800, marginBottom: '4px' }}>🔒 WhatsApp AI Notice:</div>
              Automated WhatsApp AI messages are locked during the trial. Once your monthly payment of ₹{price.toLocaleString('en-IN')} processes on Day 7 (or if you pay early), autonomous WhatsApp AI will unlock instantly.
            </div>
          )}

          <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Subscription Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <div><strong>Hospital:</strong> {hospital.name}</div>
              <div><strong>Owner Account:</strong> {owner.email}</div>
              <div><strong>Plan:</strong> {PLAN_LABELS[plan]}</div>
              <div><strong>Status:</strong> {isTrial ? '7-Day Free Trial (Autopay Enrolled)' : 'Paid & Active'}</div>
              <div><strong>Monthly Autopay:</strong> ₹{price.toLocaleString('en-IN')}/mo</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn-primary" onClick={() => setShowStaffRoster(true)} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              Set Up Staff &amp; Roles <ArrowRight size={16} />
            </button>
            <button className="btn-ghost" onClick={enterPortal} style={{ width: '100%', justifyContent: 'center' }}>
              Skip &amp; Enter Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Render via Portal so it truly centers over the viewport ────────────────
  if (showStaffRoster && checkoutResult) {
    return createPortal(
      <StaffRosterModal
        tenantId={checkoutResult.tenant.id}
        tenantName={checkoutResult.tenant.name}
        onClose={() => { setShowStaffRoster(false); enterPortal(); }}
      />,
      document.body
    );
  }

  return createPortal(
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, backdropFilter: 'blur(5px)', padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '20px',
        width: '100%', maxWidth: '580px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        border: '1px solid var(--border)', overflow: 'hidden',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              {step === 'confirm' ? '🎉 Welcome to Futoracare!' : 'Start Your Free Trial'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {step !== 'confirm' && `Step ${stepIdx + 1} of ${STEPS.length - 1}`}
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'var(--bg-hover)', cursor: 'pointer', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        {step !== 'confirm' && (
          <div style={{ height: '3px', background: 'var(--border)', flexShrink: 0 }}>
            <div style={{ height: '100%', width: `${((stepIdx + 1) / (STEPS.length - 1)) * 100}%`, background: 'var(--primary)', transition: 'width 0.4s ease', borderRadius: '99px' }} />
          </div>
        )}

        {/* Step Body */}
        {stepBody}

        {/* Footer Navigation */}
        {step !== 'confirm' && (
          <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexShrink: 0 }}>
            <button className="btn-ghost" onClick={() => stepIdx > 0 ? setStep(STEPS[stepIdx - 1]) : onClose()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={15} />
              {stepIdx === 0 ? 'Cancel' : 'Back'}
            </button>
            <button
              className="btn-primary"
              disabled={isLoading}
              onClick={() => {
                if (step === 'plan') { setStep('hospital'); setErrors({}); }
                else if (step === 'hospital') { if (validateHospital()) { setStep('owner'); setErrors({}); } }
                else if (step === 'owner') { if (validateOwner()) { setStep('payment'); setErrors({}); } }
                else if (step === 'payment') { handleCheckout(); }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isLoading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                : step === 'payment'
                  ? <>Complete Purchase <Lock size={14} /></>
                  : <>Continue <ArrowRight size={15} /></>
              }
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
