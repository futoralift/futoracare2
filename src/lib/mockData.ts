import {
  Appointment,
  WhatsAppThread,
  VoiceCall,
  LabReport,
  Feedback,
  WorkflowLog,
  Patient,
  Tenant,
  DeptVolume,
} from '@/types';

// Pure zero-mock initial states. Every hospital starts with empty records.
export const TENANTS: Tenant[] = [];
export const PATIENTS: Patient[] = [];
export const APPOINTMENTS: Appointment[] = [];
export const WHATSAPP_THREADS: WhatsAppThread[] = [];
export const VOICE_CALLS: VoiceCall[] = [];
export const LAB_REPORTS: LabReport[] = [];
export const FEEDBACK_LIST: Feedback[] = [];
export const WORKFLOW_LOGS: WorkflowLog[] = [];
export const DEPT_VOLUME: DeptVolume[] = [];
export const WEEKLY_VOLUME: Array<{ day: string; appointments: number; completed: number; aiHandled: number; whatsapp: number; calls: number }> = [
  { day: 'Mon', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
  { day: 'Tue', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
  { day: 'Wed', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
  { day: 'Thu', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
  { day: 'Fri', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
  { day: 'Sat', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
  { day: 'Sun', appointments: 0, completed: 0, aiHandled: 0, whatsapp: 0, calls: 0 },
];
