// ─── Core Domain Types ───────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark';

export type StaffRole =
  | 'super_admin'
  | 'hospital_owner'
  | 'doctor'
  | 'receptionist'
  | 'lab_technician'
  | 'care_coordinator';

export type AppModule =
  | 'dashboard'
  | 'appointments'
  | 'patients'
  | 'whatsapp'
  | 'voice-calls'
  | 'reports'
  | 'csat'
  | 'analytics'
  | 'workflows'
  | 'settings'
  | 'super_admin';

export type AppView =
  | 'landing'
  | 'super_admin'
  | 'dashboard'
  | 'appointments'
  | 'patients'
  | 'whatsapp'
  | 'voice-calls'
  | 'reports'
  | 'csat'
  | 'analytics'
  | 'workflows'
  | 'settings';

export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trial' | 'suspended' | 'cancelled' | 'expired';
export type PaymentMethod = 'upi' | 'netbanking' | 'card';
export type BillingCycle = 'monthly' | 'annual';

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'missed' | 'cancelled';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type CallStatus = 'completed' | 'missed' | 'in-progress' | 'scheduled';
export type SentimentType = 'positive' | 'neutral' | 'negative';
export type MessageRole = 'patient' | 'ai' | 'staff';

/** RBAC: Maps a role to allowed modules */
export const ROLE_PERMISSIONS: Record<StaffRole, AppModule[]> = {
  super_admin: ['dashboard', 'appointments', 'patients', 'whatsapp', 'voice-calls', 'reports', 'csat', 'analytics', 'workflows', 'settings', 'super_admin'],
  hospital_owner: ['dashboard', 'appointments', 'patients', 'whatsapp', 'voice-calls', 'reports', 'csat', 'analytics', 'workflows', 'settings'],
  doctor: ['dashboard', 'appointments', 'patients', 'whatsapp', 'reports'],
  receptionist: ['dashboard', 'appointments', 'patients', 'whatsapp'],
  lab_technician: ['reports'],
  care_coordinator: ['dashboard', 'whatsapp', 'voice-calls', 'csat'],
};

export const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; annual: number }> = {
  starter:    { monthly: 5000,  annual: 4000  },
  growth:     { monthly: 8000,  annual: 6400  },
  enterprise: { monthly: 10000, annual: 8000  },
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  starter:    'Starter Clinic',
  growth:     'Growth Hospital',
  enterprise: 'Enterprise Health System',
};

// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  department?: string;
  customPermissions?: AppModule[];
  isActive: boolean;
  createdAt: string;
  avatarInitials?: string;
}

export interface HospitalOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
}

// ─── Subscription & Billing ───────────────────────────────────────────────────

export interface Subscription {
  id: string;
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  pricePerCycle: number;
  startDate: string;
  nextRenewal: string;
  totalPaid: number;
  transactions: PaymentTransaction[];
  // 7-day trial & recurring autopay fields
  isTrial?: boolean;
  trialEndsAt?: string;
  autopayEnabled?: boolean;
  autopayStatus?: 'active' | 'pending' | 'failed' | 'disabled';
  autopayMethod?: PaymentMethod;
  whatsappAiEnabled?: boolean; // false during free trial, true once paid
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: 'success' | 'pending' | 'failed';
  txnRef: string;
  date: string;
  plan: SubscriptionPlan;
}

// ─── Tenant / Hospital ─────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  branch: string;
  city: string;
  beds: number;
  doctors: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  owner: HospitalOwner;
  createdAt: string;
  logo?: string;
}

// ─── Clinical Domain ──────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  tenantId?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  email?: string;
  riskLevel: RiskLevel;
  diagnosis: string;
  lastVisit: string;
  consultations: number;
  tags: string[];
  vitals?: { bp: string; pulse: number; spo2: number; temp: string };
}

export interface Appointment {
  id: string;
  tenantId?: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: 'in-person' | 'teleconsult';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  sentiment?: SentimentType;
}

export interface WhatsAppThread {
  id: string;
  tenantId?: string;
  patientName: string;
  phone: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  status: 'ai-handling' | 'staff-handling' | 'resolved';
  messages: ChatMessage[];
}

export interface VoiceCall {
  id: string;
  tenantId?: string;
  patientName: string;
  phone: string;
  duration: string;
  status: CallStatus;
  aiHandled: boolean;
  sentiment: SentimentType;
  date: string;
  time: string;
  transcript?: TranscriptLine[];
  purpose: string;
}

export interface TranscriptLine {
  speaker: 'AI' | 'Patient';
  text: string;
  timestamp: string;
}

export interface LabReport {
  id: string;
  tenantId?: string;
  patientName: string;
  patientId: string;
  testName: string;
  date: string;
  status: 'normal' | 'abnormal' | 'critical';
  dispatched: boolean;
  results: LabResult[];
  aiSummary?: string;
}

export interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'H' | 'L' | 'HH' | 'LL';
}

export interface Feedback {
  id: string;
  tenantId?: string;
  patientName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  emotion: 'angry' | 'frustrated' | 'neutral' | 'satisfied' | 'delighted';
  comment: string;
  date: string;
  department: string;
  autoApologyDispatched: boolean;
  sentiment: SentimentType;
}

export interface WorkflowLog {
  id: string;
  tenantId?: string;
  workflowName: string;
  trigger: string;
  status: 'success' | 'failed' | 'running' | 'queued';
  duration: string;
  nodes: number;
  timestamp: string;
}

export interface DeptVolume {
  name: string;
  appointments: number;
  aiHandled: number;
}

export interface WeeklyVolume {
  day: string;
  appointments: number;
  completed: number;
  aiHandled: number;
}

// ─── Super Admin Analytics ─────────────────────────────────────────────────────

export interface SuperAdminMetrics {
  totalHospitals: number;
  activeSubscriptions: number;
  trialAccounts: number;
  totalMRR: number;
  totalRevenueCollected: number;
  totalBeds: number;
  totalDoctors: number;
  totalPatients?: number;
  monthlyGrowth: number;
}
