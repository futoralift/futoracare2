import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppView, ThemeMode, StaffRole, AppModule, ROLE_PERMISSIONS, StaffMember, SubscriptionPlan } from '@/types';

interface UIState {
  theme: ThemeMode;
  activeView: AppView;
  sidebarCollapsed: boolean;
  activeTenantId: string;
  omniOpen: boolean;
  notifOpen: boolean;

  // ── Auth / RBAC ─────────────────────────────────────────────────────────────
  activeUser: StaffMember | null;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;

  // ── 7-Day Trial & Subscription Lock ──────────────────────────────────────────
  isTrial: boolean;
  trialEndsAt: string | null;
  isSubscriptionLocked: boolean;
  whatsappAiEnabled: boolean;
  subscriptionPlan: SubscriptionPlan;
  isDemoMode: boolean;

  // ── Computed helpers ────────────────────────────────────────────────────────
  canAccess: (module: AppModule) => boolean;

  // ── Actions ──────────────────────────────────────────────────────────────────
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setActiveView: (view: AppView) => void;
  toggleSidebar: () => void;
  setActiveTenantId: (id: string) => void;
  setOmniOpen: (open: boolean) => void;
  setNotifOpen: (open: boolean) => void;
  loginAs: (user: StaffMember, tenantId: string, hasSubscription: boolean, isTrial?: boolean, plan?: SubscriptionPlan) => void;
  startTrial: (user: StaffMember, tenantId: string, plan: SubscriptionPlan) => void;
  startDemo: () => void;
  completePaymentAndUnlock: () => void;
  simulateTrialExpiry: () => void;
  logout: () => void;
}

/** Demo Hospital Owner user */
export const DEMO_USER: StaffMember = {
  id: 'staff_demo_doctor',
  tenantId: 't_demo_apex',
  name: 'Dr. Rajesh Sharma',
  email: 'dr.sharma@apexhealth.in',
  phone: '+91 98765 43210',
  role: 'hospital_owner',
  isActive: true,
  createdAt: '2026-01-15',
  avatarInitials: 'RS',
};

/** Platform Super Admin user (Futoracare platform owner) */
export const SUPER_ADMIN: StaffMember = {
  id: 'sa_madhur',
  tenantId: 'platform',
  name: 'Madhur',
  email: 'madhur@futoragroup.com',
  phone: '+91 99999 88888',
  role: 'super_admin',
  isActive: true,
  createdAt: '2024-01-01',
  avatarInitials: 'MF',
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      activeView: 'landing',
      sidebarCollapsed: false,
      activeTenantId: '',
      omniOpen: false,
      notifOpen: false,

      // Default: not authenticated, start on landing
      activeUser: null,
      isAuthenticated: false,
      hasActiveSubscription: false,

      // 7-day trial & recurring autopay lock state
      isTrial: false,
      trialEndsAt: null,
      isSubscriptionLocked: false,
      whatsappAiEnabled: true,
      subscriptionPlan: 'growth',
      isDemoMode: false,

      canAccess: (module: AppModule): boolean => {
        const { activeUser, isAuthenticated, isSubscriptionLocked } = get();
        if (!isAuthenticated || !activeUser || isSubscriptionLocked) return false;
        const permissions = activeUser.customPermissions ?? ROLE_PERMISSIONS[activeUser.role] ?? [];
        return permissions.includes(module);
      },

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setActiveView: (activeView) => set({ activeView }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setActiveTenantId: (activeTenantId) => set({ activeTenantId }),
      setOmniOpen: (omniOpen) => set({ omniOpen }),
      setNotifOpen: (notifOpen) => set({ notifOpen }),

      loginAs: (user, tenantId, hasSubscription, isTrial = false, plan = 'growth') => {
        const firstAllowedView = (user.customPermissions ?? ROLE_PERMISSIONS[user.role])[0] as AppView ?? 'dashboard';
        const view: AppView = user.role === 'super_admin' ? 'super_admin' : firstAllowedView;
        const now = new Date();
        const trialEnd = new Date(now.setDate(now.getDate() + 7)).toISOString().split('T')[0];
        set({
          activeUser: user,
          activeTenantId: tenantId,
          isAuthenticated: true,
          hasActiveSubscription: hasSubscription || isTrial,
          isTrial,
          trialEndsAt: isTrial ? trialEnd : null,
          isSubscriptionLocked: false,
          whatsappAiEnabled: !isTrial, // LOCKED during trial!
          subscriptionPlan: plan,
          activeView: view,
          isDemoMode: false,
        });
      },

      startTrial: (user, tenantId, plan) => {
        const firstAllowedView = (user.customPermissions ?? ROLE_PERMISSIONS[user.role])[0] as AppView ?? 'dashboard';
        const view: AppView = user.role === 'super_admin' ? 'super_admin' : firstAllowedView;
        const now = new Date();
        const trialEnd = new Date(now.setDate(now.getDate() + 7)).toISOString().split('T')[0];
        set({
          activeUser: user,
          activeTenantId: tenantId,
          isAuthenticated: true,
          hasActiveSubscription: true,
          isTrial: true,
          trialEndsAt: trialEnd,
          isSubscriptionLocked: false,
          whatsappAiEnabled: false, // 🔒 WHATSAPP AI LOCKED IN FREE TRIAL
          subscriptionPlan: plan,
          activeView: view,
          isDemoMode: false,
        });
      },

      startDemo: () => {
        // Trigger seed endpoint in background
        if (typeof window !== 'undefined') {
          fetch('/api/demo/seed', { method: 'POST' }).catch(() => {});
        }
        set({
          activeUser: DEMO_USER,
          activeTenantId: 't_demo_apex',
          isAuthenticated: true,
          hasActiveSubscription: true,
          isTrial: false,
          trialEndsAt: null,
          isSubscriptionLocked: false,
          whatsappAiEnabled: true,
          subscriptionPlan: 'enterprise',
          activeView: 'dashboard',
          isDemoMode: true,
        });
      },

      completePaymentAndUnlock: () => {
        set({
          isTrial: false,
          hasActiveSubscription: true,
          isSubscriptionLocked: false,
          whatsappAiEnabled: true, // 🔓 UNLOCKED ON PAYMENT
          trialEndsAt: null,
        });
      },

      simulateTrialExpiry: () => {
        set({
          isSubscriptionLocked: true,
          hasActiveSubscription: false,
        });
      },

      logout: () => set({
        activeUser: null,
        isAuthenticated: false,
        hasActiveSubscription: false,
        isTrial: false,
        trialEndsAt: null,
        isSubscriptionLocked: false,
        isDemoMode: false,
        activeView: 'landing',
      }),
    }),
    { name: 'futoracare-ui' }
  )
);

