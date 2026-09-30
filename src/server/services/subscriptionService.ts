import { Subscription, Tenant, StaffMember, SubscriptionPlan, BillingCycle, PaymentMethod, PLAN_PRICES } from '@/types';
import { repository } from '@/server/db/repository';
import { nanoid } from '@/server/utils/nanoid';

export interface CheckoutPayload {
  hospitalName: string;
  branch: string;
  city: string;
  beds: number;
  doctors: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerDesignation: string;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethod;
  isTrial?: boolean;
}

export interface CheckoutResult {
  tenant: Tenant;
  subscription: Subscription;
  ownerStaffMember: StaffMember;
  invoiceRef: string;
}

export const subscriptionService = {
  checkout: (payload: CheckoutPayload): CheckoutResult => {
    const tenantId = `t_${Date.now()}`;
    const ownerId = `o_${tenantId}`;
    const subscriptionId = `sub_${tenantId}`;
    const txnRef = `TXN_FUTORA_${Date.now()}`;
    const now = new Date();
    const startDate = now.toISOString().split('T')[0];

    const isTrial = !!payload.isTrial;
    const trialDays = 7;
    const trialEndDate = new Date(new Date(now).getTime() + trialDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const nextRenewal = isTrial
      ? trialEndDate // Autopay charges at end of 7 days
      : new Date(
          payload.billingCycle === 'annual'
            ? new Date(now).setFullYear(now.getFullYear() + 1)
            : new Date(now).setMonth(now.getMonth() + 1)
        ).toISOString().split('T')[0];

    const pricePerCycle = PLAN_PRICES[payload.plan][payload.billingCycle];
    const totalPaid = isTrial ? 0 : (payload.billingCycle === 'annual' ? pricePerCycle * 12 : pricePerCycle);

    // 1. Create tenant
    const tenant: Tenant = {
      id: tenantId,
      name: payload.hospitalName,
      branch: payload.branch,
      city: payload.city,
      beds: payload.beds,
      doctors: payload.doctors,
      plan: payload.plan,
      status: isTrial ? 'trial' : 'active',
      owner: {
        id: ownerId,
        name: payload.ownerName,
        email: payload.ownerEmail,
        phone: payload.ownerPhone,
        designation: payload.ownerDesignation,
      },
      createdAt: startDate,
    };
    repository.tenants.insert(tenant);

    // 2. Create subscription with 7-Day Trial & Autopay details
    const subscription: Subscription = {
      id: subscriptionId,
      tenantId,
      plan: payload.plan,
      status: isTrial ? 'trial' : 'active',
      billingCycle: payload.billingCycle,
      pricePerCycle,
      startDate,
      nextRenewal,
      totalPaid,
      isTrial,
      trialEndsAt: isTrial ? trialEndDate : undefined,
      autopayEnabled: true,
      autopayStatus: 'active',
      autopayMethod: payload.paymentMethod,
      whatsappAiEnabled: !isTrial, // 🔒 LOCKED in trial, UNLOCKED on paid
      transactions: [{
        id: nanoid('txn'),
        amount: totalPaid,
        method: payload.paymentMethod,
        status: 'success',
        txnRef: isTrial ? `MANDATE_AUTH_${Date.now()}` : txnRef,
        date: startDate,
        plan: payload.plan,
      }],
    };
    repository.subscriptions.insert(subscription);

    // 3. Create Hospital Owner staff member
    const ownerStaff: StaffMember = {
      id: `staff_owner_${tenantId}`,
      tenantId,
      name: payload.ownerName,
      email: payload.ownerEmail,
      phone: payload.ownerPhone,
      role: 'hospital_owner',
      isActive: true,
      createdAt: startDate,
      avatarInitials: payload.ownerName.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2),
    };
    repository.staff.insert(ownerStaff);

    return { tenant, subscription, ownerStaffMember: ownerStaff, invoiceRef: txnRef };
  },

  payAndUnlock: (tenantId: string): Subscription | null => {
    const existing = repository.subscriptions.getByTenant(tenantId);
    if (!existing) return null;

    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const nextRenewal = new Date(new Date(now).setMonth(now.getMonth() + 1)).toISOString().split('T')[0];
    const price = existing.pricePerCycle;

    const updated: Subscription = {
      ...existing,
      status: 'active',
      isTrial: false,
      whatsappAiEnabled: true, // 🔓 UNLOCK Automated WhatsApp
      totalPaid: existing.totalPaid + price,
      nextRenewal,
      transactions: [
        ...existing.transactions,
        {
          id: nanoid('txn'),
          amount: price,
          method: existing.autopayMethod ?? 'upi',
          status: 'success',
          txnRef: `AUTOPAY_PAID_${Date.now()}`,
          date: startDate,
          plan: existing.plan,
        },
      ],
    };

    repository.subscriptions.update(existing.id, updated);
    repository.tenants.update(tenantId, { status: 'active' });
    return updated;
  },

  getSubscription: (tenantId: string): Subscription | undefined => {
    return repository.subscriptions.getByTenant(tenantId);
  },

  hasActiveSubscription: (tenantId: string): boolean => {
    const sub = repository.subscriptions.getByTenant(tenantId);
    return !!sub && (sub.status === 'active' || sub.status === 'trial');
  },
};
