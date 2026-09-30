import { db } from '../server/db/repository';
import { AppointmentService } from '../server/services/appointmentService';
import { PatientService } from '../server/services/patientService';
import { AIChatService } from '../server/services/aiChatService';
import { LabReportService } from '../server/services/labReportService';
import { CSATService } from '../server/services/csatService';
import {
  CreateAppointmentSchema,
  CreatePatientSchema,
  CreateLabReportSchema,
} from '../server/validation/schemas';

export function runAllTests() {
  const results: { suite: string; test: string; passed: boolean; error?: string }[] = [];

  function test(suite: string, name: string, fn: () => void) {
    try {
      fn();
      results.push({ suite, test: name, passed: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ suite, test: name, passed: false, error: msg });
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  // ─── 1. Validation Schemas ────────────────────────────────────────────────
  test('Zod Schemas', 'CreateAppointmentSchema validates correct payload', () => {
    const valid = CreateAppointmentSchema.safeParse({
      patientName: 'Test Patient',
      doctorName: 'Dr. Test',
      department: 'Cardiology',
      date: '2026-09-05',
      time: '10:00 AM',
      type: 'in-person',
    });
    assert(valid.success, 'Valid appointment failed schema');
  });

  test('Zod Schemas', 'CreateAppointmentSchema rejects invalid date format', () => {
    const invalid = CreateAppointmentSchema.safeParse({
      patientName: 'Test Patient',
      doctorName: 'Dr. Test',
      department: 'Cardiology',
      date: '05-09-2026', // wrong format
      time: '10:00 AM',
    });
    assert(!invalid.success, 'Invalid date should have failed');
  });

  test('Zod Schemas', 'CreatePatientSchema validates vitals and risk', () => {
    const valid = CreatePatientSchema.safeParse({
      name: 'John Doe',
      age: 40,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+919876543210',
      diagnosis: 'Hypertension',
      riskLevel: 'medium',
    });
    assert(valid.success, 'Valid patient failed schema');
  });

  test('Zod Schemas', 'CreateLabReportSchema validates diagnostic panel', () => {
    const valid = CreateLabReportSchema.safeParse({
      patientName: 'Jane Smith',
      testName: 'Lipid Panel',
      date: '2026-09-02',
      results: [
        { parameter: 'Total Cholesterol', value: '190', unit: 'mg/dL', referenceRange: '< 200' },
      ],
    });
    assert(valid.success, 'Valid lab report failed schema');
  });

  // ─── 2. Appointment Service ───────────────────────────────────────────────
  test('AppointmentService', 'Creates and fetches appointments with filter', () => {
    const created = AppointmentService.create({
      patientName: 'Unit Test Patient',
      doctorName: 'Dr. Unit',
      department: 'Neurology',
      date: '2026-09-10',
      time: '11:00 AM',
      type: 'teleconsult',
    });
    assert(!!created.id, 'Appointment ID missing');
    assert(created.status === 'confirmed', 'Default status must be confirmed');

    const list = AppointmentService.getAll(undefined, 'Unit Test Patient');
    assert(list.some((a) => a.id === created.id), 'Created appointment not found in search');
  });

  test('AppointmentService', 'Updates appointment status', () => {
    const created = AppointmentService.create({
      patientName: 'Status Test',
      doctorName: 'Dr. Test',
      department: 'General Medicine',
      date: '2026-09-10',
      time: '11:30 AM',
    });

    const updated = AppointmentService.updateStatus(created.id, 'completed');
    assert(updated?.status === 'completed', 'Status update failed');
  });

  // ─── 3. Patient Service & Risk Stratification ─────────────────────────────
  test('PatientService', 'Auto-escalates risk for abnormal vitals', () => {
    const patient = PatientService.create({
      name: 'Critical Vitals Patient',
      age: 65,
      gender: 'Male',
      bloodGroup: 'AB+',
      phone: '+919999988888',
      diagnosis: 'Severe Dyspnea',
      vitals: {
        bp: '160/100',
        pulse: 120, // Critical (>110)
        spo2: 89, // Critical (<92)
        temp: '101.2°F',
      },
    });

    assert(patient.riskLevel === 'critical', `Expected critical risk, got ${patient.riskLevel}`);
  });

  // ─── 4. WhatsApp AI Intent & Clinical Triage ──────────────────────────────
  test('AIChatService', 'Triggers Emergency Alert on chest pain', () => {
    const res = AIChatService.generateResponse('Doctor please help, I have severe chest pain and breathlessness');
    assert(res.isEmergency === true, 'Emergency flag not raised for chest pain');
    assert(res.responseText.includes('EMERGENCY ALERT'), 'Emergency alert text missing');
  });

  test('AIChatService', 'Handles appointment booking intent', () => {
    const res = AIChatService.generateResponse('Can I book an appointment with Dr. Mehta tomorrow?');
    assert(res.isEmergency === false, 'Non-emergency flagged as emergency');
    assert(res.responseText.includes('Which department'), 'Booking response prompt missing');
  });

  // ─── 5. Lab Reports AI Summarizer ─────────────────────────────────────────
  test('LabReportService', 'Flags critical biomarkers automatically', () => {
    const report = LabReportService.create({
      patientName: 'Lab Unit Test Patient',
      testName: 'Renal Function Panel',
      date: '2026-09-01',
      results: [
        { parameter: 'Serum Creatinine', value: '3.4', unit: 'mg/dL', referenceRange: '0.7–1.2', flag: 'HH' },
        { parameter: 'eGFR', value: '18', unit: 'mL/min', referenceRange: '> 60', flag: 'LL' },
      ],
    });

    assert(report.status === 'critical', `Expected critical status, got ${report.status}`);
    assert(report.aiSummary?.includes('CRITICAL') === true, 'AI summary missing critical keyword');
  });

  // ─── 6. CSAT Feedback & Auto-Apology ──────────────────────────────────────
  test('CSATService', 'Dispatches auto-apology for rating <= 2', () => {
    const feedback = CSATService.create({
      patientName: 'Dissatisfied Patient',
      rating: 1,
      emotion: 'angry',
      comment: 'Waited 2 hours with no update.',
      department: 'Emergency',
    });

    assert(feedback.autoApologyDispatched === true, 'Auto-apology should be dispatched for rating 1');
    assert(feedback.sentiment === 'negative', 'Sentiment should be negative');
  });

  // ─── 7. Aggregate Dashboard Stats ─────────────────────────────────────────
  test('Repository Stats', 'Computes aggregate counters and weekly volume', () => {
    const stats = db.getDashboardStats();
    assert(stats.totalPatients >= 0, 'Expected valid totalPatients count');
    assert(stats.weeklyVolume.length === 7, 'Expected 7 days of weekly volume data');
    assert(typeof stats.todayAppointments === 'number', 'Expected valid todayAppointments count');
  });

  return results;
}
