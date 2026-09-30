import { z } from 'zod';

export const CreateAppointmentSchema = z.object({
  patientName: z.string().min(2, 'Patient name must be at least 2 characters'),
  doctorName: z.string().min(2, 'Doctor name must be at least 2 characters'),
  department: z.string().min(2, 'Department is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  time: z.string().min(1, 'Time is required'),
  type: z.enum(['in-person', 'teleconsult']).default('in-person'),
  notes: z.string().optional(),
  patientId: z.string().optional(),
});

export const UpdateAppointmentStatusSchema = z.object({
  status: z.enum(['confirmed', 'pending', 'completed', 'missed', 'cancelled']),
});

export const CreatePatientSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  age: z.number().int().min(0).max(130, 'Age must be between 0 and 130'),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  diagnosis: z.string().min(3, 'Diagnosis description required'),
  tags: z.array(z.string()).default([]),
  vitals: z.object({
    bp: z.string().default('120/80'),
    pulse: z.number().int().default(72),
    spo2: z.number().int().default(98),
    temp: z.string().default('98.6°F'),
  }).optional(),
});

export const SendWhatsAppMessageSchema = z.object({
  threadId: z.string().min(1, 'Thread ID required'),
  content: z.string().min(1, 'Message content cannot be empty'),
  role: z.enum(['patient', 'ai', 'staff']).default('patient'),
});

export const TriggerVoiceCallSchema = z.object({
  patientName: z.string().min(2, 'Patient name required'),
  phone: z.string().min(10, 'Valid phone required'),
  purpose: z.string().min(3, 'Call purpose required'),
  aiHandled: z.boolean().default(true),
});

export const CreateLabReportSchema = z.object({
  patientName: z.string().min(2, 'Patient name required'),
  patientId: z.string().default('p1'),
  testName: z.string().min(2, 'Test name required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  status: z.enum(['normal', 'abnormal', 'critical']).default('normal'),
  results: z.array(
    z.object({
      parameter: z.string().min(1),
      value: z.string().min(1),
      unit: z.string(),
      referenceRange: z.string(),
      flag: z.enum(['L', 'H', 'LL', 'HH']).optional(),
    })
  ).min(1, 'At least 1 test result parameter required'),
  aiSummary: z.string().optional(),
});

export const CreateFeedbackSchema = z.object({
  patientName: z.string().min(2, 'Patient name required'),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  emotion: z.enum(['delighted', 'satisfied', 'neutral', 'frustrated', 'angry']),
  comment: z.string().min(3, 'Comment required'),
  department: z.string().min(2, 'Department required'),
  sentiment: z.enum(['positive', 'neutral', 'negative']).default('positive'),
});

export const UpdateSettingsSchema = z.object({
  llmModel: z.string().optional(),
  whatsappPersona: z.string().optional(),
  voiceAccent: z.string().optional(),
  voiceProvider: z.string().optional(),
  webhookUrl: z.string().url('Must be a valid URL').optional(),
  webhookSecret: z.string().optional(),
  autoApologyEnabled: z.boolean().optional(),
  emergencyEscalation: z.boolean().optional(),
});
