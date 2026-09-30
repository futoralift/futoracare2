import {
  Tenant, Patient, Appointment, WhatsAppThread, ChatMessage,
  VoiceCall, LabReport, Feedback, WorkflowLog, DeptVolume,
  AppointmentStatus, SentimentType, StaffMember, Subscription,
} from '@/types';
import { getCollection, setCollection, insertRecord, updateRecord } from './dbEngine';
import { query } from './pg';

/**
 * Multi-tenant repository backed by the persistent dbEngine and live PostgreSQL 18.
 * All clinical records start at 0 and populate purely via user input and autonomous AI.
 */

function asyncPgQuery(text: string, params?: unknown[]) {
  query(text, params).catch((err) => {
    console.warn('[PostgreSQL Sync Notice]:', err.message);
  });
}

// ─── Helper ID generators ─────────────────────────────────────────────────────
function nanoid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Tenants ─────────────────────────────────────────────────────────────────
const TenantRepo = {
  getAll: (): Tenant[] => getCollection<Tenant>('tenants'),
  getById: (id: string): Tenant | undefined => getCollection<Tenant>('tenants').find((t) => t.id === id),
  insert: (t: Tenant): Tenant => {
    const res = insertRecord<Tenant>('tenants', t);
    asyncPgQuery(
      `INSERT INTO tenants (id, name, branch, city, beds, doctors, plan, status, created_at, owner)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, beds = EXCLUDED.beds, status = EXCLUDED.status`,
      [t.id, t.name, t.branch, t.city, t.beds || 0, t.doctors || 0, t.plan || 'starter', t.status || 'active', t.createdAt || '2024-01-01', JSON.stringify(t.owner || {})]
    );
    return res;
  },
  update: (id: string, updates: Partial<Tenant>): Tenant | null => updateRecord<Tenant>('tenants', id, updates),
};

// ─── Staff Members ─────────────────────────────────────────────────────────────
const StaffRepo = {
  getAll: (): StaffMember[] => getCollection<StaffMember>('staffMembers'),
  getByTenant: (tenantId: string): StaffMember[] => getCollection<StaffMember>('staffMembers').filter((s) => s.tenantId === tenantId),
  getById: (id: string): StaffMember | undefined => getCollection<StaffMember>('staffMembers').find((s) => s.id === id),
  insert: (s: StaffMember): StaffMember => insertRecord<StaffMember>('staffMembers', s),
  update: (id: string, updates: Partial<StaffMember>): StaffMember | null => updateRecord<StaffMember>('staffMembers', id, updates),
};

// ─── Subscriptions ─────────────────────────────────────────────────────────────
const SubscriptionRepo = {
  getAll: (): Subscription[] => getCollection<Subscription>('subscriptions'),
  getByTenant: (tenantId: string): Subscription | undefined => getCollection<Subscription>('subscriptions').find((s) => s.tenantId === tenantId),
  insert: (s: Subscription): Subscription => insertRecord<Subscription>('subscriptions', s),
  update: (id: string, updates: Partial<Subscription>): Subscription | null => updateRecord<Subscription>('subscriptions', id, updates),
};

// ─── Patients ─────────────────────────────────────────────────────────────────
const PatientRepo = {
  getByTenant: (tenantId: string): Patient[] => getCollection<Patient>('patients').filter((p) => !p.tenantId || p.tenantId === tenantId),
  getById: (id: string): Patient | undefined => getCollection<Patient>('patients').find((p) => p.id === id),
  insert: (p: Omit<Patient, 'id'> & { tenantId: string }): Patient => {
    const record: Patient = { ...p, id: nanoid('p') } as Patient;
    const res = insertRecord<Patient>('patients', record);
    asyncPgQuery(
      `INSERT INTO patients (id, tenant_id, name, age, gender, blood_group, phone, email, risk_level, diagnosis, last_visit, consultations, tags, vitals)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING`,
      [record.id, record.tenantId, record.name, record.age, record.gender, record.bloodGroup || null, record.phone, record.email || null, record.riskLevel, record.diagnosis, record.lastVisit || null, record.consultations || 0, JSON.stringify(record.tags || []), JSON.stringify(record.vitals || {})]
    );
    return res;
  },
};

// ─── Appointments ─────────────────────────────────────────────────────────────
const AppointmentRepo = {
  getByTenant: (tenantId: string, filters?: { date?: string; status?: AppointmentStatus; doctorName?: string }): Appointment[] => {
    let list = getCollection<Appointment>('appointments').filter((a) => !a.tenantId || a.tenantId === tenantId);
    if (filters?.date) list = list.filter((a) => a.date === filters.date);
    if (filters?.status) list = list.filter((a) => a.status === filters.status);
    if (filters?.doctorName) list = list.filter((a) => a.doctorName === filters.doctorName);
    return list;
  },
  getById: (id: string): Appointment | undefined => getCollection<Appointment>('appointments').find((a) => a.id === id),
  insert: (a: Omit<Appointment, 'id'> & { tenantId: string }): Appointment => {
    const record: Appointment = { ...a, id: nanoid('a') } as Appointment;
    const res = insertRecord<Appointment>('appointments', record);
    asyncPgQuery(
      `INSERT INTO appointments (id, tenant_id, patient_id, patient_name, doctor_name, department, date, time, status, type, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [record.id, record.tenantId, record.patientId || '', record.patientName, record.doctorName, record.department, record.date, record.time, record.status, record.type || 'in-person', record.notes || null]
    );
    return res;
  },
  updateStatus: (id: string, status: AppointmentStatus): Appointment | null => {
    const res = updateRecord<Appointment>('appointments', id, { status });
    asyncPgQuery(`UPDATE appointments SET status = $1 WHERE id = $2`, [status, id]);
    return res;
  },
};

// ─── WhatsApp Threads ─────────────────────────────────────────────────────────
const WhatsAppRepo = {
  getByTenant: (tenantId: string): WhatsAppThread[] => getCollection<WhatsAppThread>('whatsappThreads').filter((w) => !w.tenantId || w.tenantId === tenantId),
  getById: (id: string): WhatsAppThread | undefined => getCollection<WhatsAppThread>('whatsappThreads').find((w) => w.id === id),
  addMessage: (threadId: string, message: Omit<ChatMessage, 'id'>): WhatsAppThread | null => {
    const threads = getCollection<WhatsAppThread>('whatsappThreads');
    const idx = threads.findIndex((t) => t.id === threadId);
    if (idx === -1) return null;
    const msg: ChatMessage = { ...message, id: nanoid('m') };
    threads[idx].messages.push(msg);
    threads[idx].lastMessage = message.content.substring(0, 60);
    threads[idx].lastTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (message.role === 'patient') threads[idx].unread += 1;
    setCollection<WhatsAppThread>('whatsappThreads', threads);
    asyncPgQuery(
      `UPDATE whatsapp_threads SET last_message = $1, last_time = $2, unread = $3, messages = $4 WHERE id = $5`,
      [threads[idx].lastMessage, threads[idx].lastTime, threads[idx].unread, JSON.stringify(threads[idx].messages), threadId]
    );
    return threads[idx];
  },
  insert: (t: Omit<WhatsAppThread, 'id'> & { tenantId: string }): WhatsAppThread => {
    const record: WhatsAppThread = { ...t, id: nanoid('w') } as WhatsAppThread;
    const res = insertRecord<WhatsAppThread>('whatsappThreads', record);
    asyncPgQuery(
      `INSERT INTO whatsapp_threads (id, tenant_id, patient_name, phone, last_message, last_time, unread, status, messages)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [record.id, record.tenantId, record.patientName, record.phone, record.lastMessage, record.lastTime, record.unread || 0, record.status, JSON.stringify(record.messages || [])]
    );
    return res;
  },
};

// ─── Voice Calls ─────────────────────────────────────────────────────────────
const VoiceCallRepo = {
  getByTenant: (tenantId: string): VoiceCall[] => getCollection<VoiceCall>('voiceCalls').filter((c) => !c.tenantId || c.tenantId === tenantId),
  insert: (c: Omit<VoiceCall, 'id'> & { tenantId: string }): VoiceCall => {
    const record: VoiceCall = { ...c, id: nanoid('c') } as VoiceCall;
    const res = insertRecord<VoiceCall>('voiceCalls', record);
    asyncPgQuery(
      `INSERT INTO voice_calls (id, tenant_id, patient_name, phone, duration, status, ai_handled, sentiment, date, time, purpose, transcript)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO NOTHING`,
      [record.id, record.tenantId, record.patientName, record.phone, record.duration || '0m 00s', record.status, record.aiHandled ?? true, record.sentiment || 'neutral', record.date, record.time, record.purpose, JSON.stringify(record.transcript || [])]
    );
    return res;
  },
};

// ─── Lab Reports ─────────────────────────────────────────────────────────────
const LabReportRepo = {
  getByTenant: (tenantId: string): LabReport[] => getCollection<LabReport>('labReports').filter((r) => !r.tenantId || r.tenantId === tenantId),
  getById: (id: string): LabReport | undefined => getCollection<LabReport>('labReports').find((r) => r.id === id),
  dispatch: (id: string): LabReport | null => {
    const res = updateRecord<LabReport>('labReports', id, { dispatched: true });
    asyncPgQuery(`UPDATE lab_reports SET dispatched = true WHERE id = $1`, [id]);
    return res;
  },
  insert: (r: Omit<LabReport, 'id'> & { tenantId: string }): LabReport => {
    const record: LabReport = { ...r, id: nanoid('r') } as LabReport;
    const res = insertRecord<LabReport>('labReports', record);
    asyncPgQuery(
      `INSERT INTO lab_reports (id, tenant_id, patient_name, patient_id, test_name, date, status, dispatched, results, ai_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [record.id, record.tenantId, record.patientName, record.patientId || null, record.testName, record.date, record.status, record.dispatched || false, JSON.stringify(record.results || []), record.aiSummary || null]
    );
    return res;
  },
};

// ─── Feedback ─────────────────────────────────────────────────────────────────
const FeedbackRepo = {
  getByTenant: (tenantId: string): Feedback[] => getCollection<Feedback>('feedback').filter((f) => !f.tenantId || f.tenantId === tenantId),
  insert: (f: Omit<Feedback, 'id'> & { tenantId: string }): Feedback => {
    const record: Feedback = { ...f, id: nanoid('f') } as Feedback;
    const res = insertRecord<Feedback>('feedback', record);
    asyncPgQuery(
      `INSERT INTO feedback (id, tenant_id, patient_name, rating, emotion, comment, date, department, auto_apology_dispatched, sentiment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [record.id, record.tenantId, record.patientName, record.rating, record.emotion, record.comment, record.date, record.department, record.autoApologyDispatched || false, record.sentiment || 'neutral']
    );
    return res;
  },
};

// ─── Workflows ─────────────────────────────────────────────────────────────────
const WorkflowRepo = {
  getByTenant: (tenantId: string): WorkflowLog[] => getCollection<WorkflowLog>('workflows').filter((w) => !w.tenantId || w.tenantId === tenantId),
  rerun: (id: string): WorkflowLog | null => {
    const res = updateRecord<WorkflowLog>('workflows', id, { status: 'running', duration: '–', timestamp: new Date().toLocaleString('en-IN') });
    asyncPgQuery(`UPDATE workflows SET status = 'running', duration = '–', timestamp = $1 WHERE id = $2`, [new Date().toLocaleString('en-IN'), id]);
    return res;
  },
  insert: (w: Omit<WorkflowLog, 'id'> & { tenantId: string }): WorkflowLog => {
    const record: WorkflowLog = { ...w, id: nanoid('wf') } as WorkflowLog;
    const res = insertRecord<WorkflowLog>('workflows', record);
    asyncPgQuery(
      `INSERT INTO workflows (id, tenant_id, workflow_name, trigger, status, duration, nodes, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [record.id, record.tenantId, record.workflowName, record.trigger, record.status, record.duration || '–', record.nodes || 3, record.timestamp]
    );
    return res;
  },
};

// ─── Pure Dynamic Stats Aggregation (Zero Mock Data) ──────────────────────────
const StatsRepo = {
  getSummary: (tenantId: string) => {
    const appts = AppointmentRepo.getByTenant(tenantId);
    const patients = PatientRepo.getByTenant(tenantId);
    const threads = WhatsAppRepo.getByTenant(tenantId);
    const calls = VoiceCallRepo.getByTenant(tenantId);
    const reports = LabReportRepo.getByTenant(tenantId);
    const feedback = FeedbackRepo.getByTenant(tenantId);
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appts.filter((a) => a.date === today);
    const pending = appts.filter((a) => a.status === 'pending').length;
    const aiHandled = threads.filter((t) => t.status === 'ai-handling').length + calls.filter((c) => c.aiHandled).length;
    const csatAvg = feedback.length > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : '0.0';
    const criticalLabCount = reports.filter((r) => r.status === 'critical').length;
    const sentiments = feedback.reduce(
      (acc, f) => { acc[f.sentiment as SentimentType] = (acc[f.sentiment as SentimentType] || 0) + 1; return acc; },
      {} as Record<SentimentType, number>
    );

    // Compute dynamic department volume directly from real appointments
    const deptMap = new Map<string, { appointments: number; aiHandled: number }>();
    for (const a of appts) {
      const dept = a.department || 'General Medicine';
      const existing = deptMap.get(dept) || { appointments: 0, aiHandled: 0 };
      existing.appointments += 1;
      deptMap.set(dept, existing);
    }
    const deptVolume: DeptVolume[] = Array.from(deptMap.entries()).map(([name, val]) => ({
      name,
      appointments: val.appointments,
      aiHandled: val.aiHandled,
    }));

    // Weekly volume for Mon-Sun: Real numbers derived from activity
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyVolume = days.map((day) => {
      const dayAppts = appts.filter((a) => {
        try {
          return new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' }) === day;
        } catch {
          return false;
        }
      });
      const dayCalls = calls.filter((c) => {
        try {
          return new Date(c.date).toLocaleDateString('en-US', { weekday: 'short' }) === day;
        } catch {
          return false;
        }
      });
      return {
        day,
        appointments: dayAppts.length,
        completed: dayAppts.filter((a) => a.status === 'completed').length,
        aiHandled: dayCalls.filter((c) => c.aiHandled).length,
        whatsapp: 0,
        calls: dayCalls.length,
      };
    });

    return {
      todayAppointments: todayAppts.length,
      totalPatients: patients.length,
      pendingAppointments: pending,
      activeWhatsAppThreads: threads.filter((t) => t.status !== 'resolved').length,
      aiAutoResolved: aiHandled,
      csatScore: parseFloat(csatAvg),
      criticalLabAlerts: criticalLabCount,
      sentimentBreakdown: sentiments,
      deptVolume,
      weeklyVolume,
    };
  },
};

// ─── Super Admin Live Platform Metrics ────────────────────────────────────────
const SuperAdminRepo = {
  getMetrics: () => {
    const tenants = TenantRepo.getAll();
    const allSubs = SubscriptionRepo.getAll();
    const activeSubs = allSubs.filter((s) => s.status === 'active' && !s.isTrial);
    const trialSubs = allSubs.filter((s) => s.status === 'trial' || s.isTrial);
    const mrr = activeSubs.reduce((sum, s) => sum + (s.pricePerCycle || 0), 0);
    const totalCollected = allSubs.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
    const beds = tenants.reduce((s, t) => s + (t.beds || 0), 0);
    const doctors = tenants.reduce((s, t) => s + (t.doctors || 0), 0);
    return {
      totalHospitals: tenants.length,
      activeSubscriptions: activeSubs.length,
      trialAccounts: trialSubs.length,
      totalMRR: mrr,
      totalRevenueCollected: totalCollected,
      totalBeds: beds,
      totalDoctors: doctors,
      monthlyGrowth: 0,
    };
  },
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export const repository = {
  tenants: TenantRepo,
  staff: StaffRepo,
  subscriptions: SubscriptionRepo,
  patients: PatientRepo,
  appointments: AppointmentRepo,
  whatsapp: WhatsAppRepo,
  voiceCalls: VoiceCallRepo,
  labReports: LabReportRepo,
  feedback: FeedbackRepo,
  workflows: WorkflowRepo,
  stats: StatsRepo,
  superAdmin: SuperAdminRepo,
};

function getDefaultTenantId(): string {
  const tenants = TenantRepo.getAll();
  return tenants[0]?.id || 'platform';
}

/**
 * Backward-compatible `db` object.
 * Existing service classes (AppointmentService, PatientService, etc.) call `db.getXxx()`.
 * This adapter maps those calls to the new repository dynamically based on active tenant.
 */
export const db = {
  // ── Appointments ──────────────────────────────────────────────────────────
  getAppointments: (status?: string, _search?: string) =>
    AppointmentRepo.getByTenant(getDefaultTenantId(), status ? { status: status as AppointmentStatus } : {}),
  getAppointmentById: (id: string) => AppointmentRepo.getById(id),
  createAppointment: (data: Partial<Appointment>) => {
    const record = { status: 'confirmed' as const, type: 'in-person' as const, tenantId: getDefaultTenantId(), ...data } as Omit<Appointment, 'id'> & { tenantId: string };
    return AppointmentRepo.insert(record);
  },
  updateAppointmentStatus: (id: string, status: AppointmentStatus) =>
    AppointmentRepo.updateStatus(id, status),

  // ── Patients ──────────────────────────────────────────────────────────────
  getPatients: (search?: string, riskLevel?: string) => {
    let list = PatientRepo.getByTenant(getDefaultTenantId());
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search));
    if (riskLevel) list = list.filter((p) => p.riskLevel === riskLevel);
    return list;
  },
  getPatientById: (id: string) => PatientRepo.getById(id),
  createPatient: (data: Partial<Patient>) => {
    const defaults = { lastVisit: new Date().toISOString().split('T')[0], consultations: 0, tenantId: getDefaultTenantId() };
    const record = { ...defaults, ...data } as Omit<Patient, 'id'> & { tenantId: string };
    return PatientRepo.insert(record);
  },
  updatePatient: (id: string, updates: Partial<Patient>) =>
    updateRecord<Patient>('patients', id, updates),

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  getWhatsAppThreads: () => WhatsAppRepo.getByTenant(getDefaultTenantId()),
  getThreadById: (id: string) => WhatsAppRepo.getById(id),
  addMessage: (threadId: string, message: Omit<ChatMessage, 'id'>) => WhatsAppRepo.addMessage(threadId, message),
  createThread: (data: Omit<WhatsAppThread, 'id'>) =>
    WhatsAppRepo.insert({ ...data, tenantId: getDefaultTenantId() } as Parameters<typeof WhatsAppRepo.insert>[0]),

  // ── Voice Calls ───────────────────────────────────────────────────────────
  getVoiceCalls: () => VoiceCallRepo.getByTenant(getDefaultTenantId()),
  createVoiceCall: (data: Partial<VoiceCall>) => {
    const now = new Date();
    const record: Omit<VoiceCall, 'id'> & { tenantId: string } = {
      tenantId: getDefaultTenantId(),
      patientName: data.patientName ?? 'Unknown',
      phone: data.phone ?? '',
      duration: data.duration ?? '0m 00s',
      status: data.status ?? 'scheduled',
      aiHandled: data.aiHandled ?? true,
      sentiment: data.sentiment ?? 'neutral',
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      purpose: data.purpose ?? 'General',
      transcript: data.transcript ?? [],
    };
    return VoiceCallRepo.insert(record);
  },

  // ── Lab Reports ───────────────────────────────────────────────────────────
  getLabReports: () => LabReportRepo.getByTenant(getDefaultTenantId()),
  getLabReportById: (id: string) => LabReportRepo.getById(id),
  dispatchLabReport: (id: string) => LabReportRepo.dispatch(id) !== null,
  createLabReport: (data: Partial<LabReport>) => {
    const record = { dispatched: false, tenantId: getDefaultTenantId(), status: 'normal' as const, results: [], ...data } as Omit<LabReport, 'id'> & { tenantId: string };
    return LabReportRepo.insert(record);
  },

  // ── CSAT / Feedback ───────────────────────────────────────────────────────
  getFeedback: () => FeedbackRepo.getByTenant(getDefaultTenantId()),
  createFeedback: (data: Partial<Feedback>) => {
    const defaults = { date: new Date().toISOString().split('T')[0], autoApologyDispatched: false, sentiment: 'neutral' as const, tenantId: getDefaultTenantId() };
    const record = { ...defaults, ...data } as Omit<Feedback, 'id'> & { tenantId: string };
    return FeedbackRepo.insert(record);
  },

  // ── Workflows ─────────────────────────────────────────────────────────────
  getWorkflows: () => WorkflowRepo.getByTenant(getDefaultTenantId()),
  rerunWorkflow: (id: string) => WorkflowRepo.rerun(id),
  createWorkflow: (data: { workflowName: string; trigger: string; nodes: number }) => {
    const record: Omit<WorkflowLog, 'id'> & { tenantId: string } = {
      tenantId: getDefaultTenantId(),
      ...data,
      status: 'queued',
      duration: '–',
      timestamp: new Date().toLocaleString('en-IN'),
    };
    return insertRecord<WorkflowLog>('workflows', { ...record, id: `wf_${Date.now()}` });
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  getStats: () => StatsRepo.getSummary(getDefaultTenantId()),
  getDashboardStats: () => StatsRepo.getSummary(getDefaultTenantId()),

  // ── Settings / Tenant ─────────────────────────────────────────────────────
  getTenant: (id: string) => TenantRepo.getById(id),
  getTenants: () => TenantRepo.getAll(),
  getAllTenants: () => TenantRepo.getAll(),
  updateTenant: (id: string, updates: Partial<Tenant>) => updateRecord<Tenant>('tenants', id, updates),
  getSettings: () => {
    const t = TenantRepo.getAll()[0];
    return {
      tenantId: t?.id || '',
      name: t?.name || 'Hospital Workspace',
      notificationsEnabled: true,
      aiAutoReply: true,
      language: 'en-IN',
    };
  },
  updateSettings: (updates: Record<string, unknown>) => ({ tenantId: getDefaultTenantId(), ...updates }),

  // ── Search ────────────────────────────────────────────────────────────────
  search: (query: string) => {
    const q = query.toLowerCase();
    const tid = getDefaultTenantId();
    const patients = PatientRepo.getByTenant(tid).filter((p) => p.name.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q));
    const appts = AppointmentRepo.getByTenant(tid).filter((a) => a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q));
    return { patients: patients.slice(0, 5), appointments: appts.slice(0, 5) };
  },
  globalSearch: (query: string) => {
    const q = query.toLowerCase();
    const tid = getDefaultTenantId();
    const patients = PatientRepo.getByTenant(tid).filter((p) => p.name.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q));
    const appts = AppointmentRepo.getByTenant(tid).filter((a) => a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q));
    return { patients: patients.slice(0, 5), appointments: appts.slice(0, 5) };
  },

  // ── WhatsApp (extra methods) ───────────────────────────────────────────────
  getWhatsAppThreadById: (id: string) => WhatsAppRepo.getById(id),
  addWhatsAppMessage: (threadId: string, message: Omit<ChatMessage, 'id'>) => WhatsAppRepo.addMessage(threadId, message),
  markWhatsAppResolved: (id: string) => updateRecord<WhatsAppThread>('whatsappThreads', id, { status: 'resolved' }),
};


