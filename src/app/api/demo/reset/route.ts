import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/server/db/dbEngine';
import {
  DEMO_TENANT, DEMO_SUBSCRIPTION, DEMO_STAFF, DEMO_PATIENTS,
  DEMO_APPOINTMENTS, DEMO_WHATSAPP_THREADS, DEMO_VOICE_CALLS,
  DEMO_LAB_REPORTS, DEMO_FEEDBACK, DEMO_WORKFLOWS, DEMO_TENANT_ID,
} from '@/lib/demoData';

export async function POST() {
  const db = readDb();

  const otherTenants = (db.tenants as Array<{ id: string }>).filter((t) => t.id !== DEMO_TENANT_ID);
  db.tenants = [DEMO_TENANT, ...otherTenants];

  const otherSubs = (db.subscriptions as Array<{ id: string }>).filter((s) => s.id !== DEMO_SUBSCRIPTION.id);
  db.subscriptions = [DEMO_SUBSCRIPTION, ...otherSubs];

  const otherStaff = (db.staffMembers as Array<{ id: string }>).filter((s) => !DEMO_STAFF.some((ds) => ds.id === s.id));
  db.staffMembers = [...DEMO_STAFF, ...otherStaff];

  // Reset to pristine demo states
  db.patients = [...DEMO_PATIENTS];
  db.appointments = [...DEMO_APPOINTMENTS];
  db.whatsappThreads = [...DEMO_WHATSAPP_THREADS];
  db.voiceCalls = [...DEMO_VOICE_CALLS];
  db.labReports = [...DEMO_LAB_REPORTS];
  db.feedback = [...DEMO_FEEDBACK];
  db.workflows = [...DEMO_WORKFLOWS];

  writeDb(db);

  return NextResponse.json({ success: true, message: 'Demo data reset to clean state' });
}
