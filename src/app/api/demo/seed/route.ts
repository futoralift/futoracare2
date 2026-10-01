import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/server/db/dbEngine';
import {
  DEMO_TENANT, DEMO_SUBSCRIPTION, DEMO_STAFF, DEMO_PATIENTS,
  DEMO_APPOINTMENTS, DEMO_WHATSAPP_THREADS, DEMO_VOICE_CALLS,
  DEMO_LAB_REPORTS, DEMO_FEEDBACK, DEMO_WORKFLOWS, DEMO_TENANT_ID,
} from '@/lib/demoData';

export async function POST() {
  const db = readDb();
  
  // Check if demo tenant is already installed
  const hasDemo = (db.tenants as Array<{ id: string }>).some((t) => t.id === DEMO_TENANT_ID);
  
  if (!hasDemo || (db.patients as unknown[]).length === 0) {
    // Put demo tenant first so getDefaultTenantId() maps to it
    const otherTenants = (db.tenants as Array<{ id: string }>).filter((t) => t.id !== DEMO_TENANT_ID);
    db.tenants = [DEMO_TENANT, ...otherTenants];

    const otherSubs = (db.subscriptions as Array<{ id: string }>).filter((s) => s.id !== DEMO_SUBSCRIPTION.id);
    db.subscriptions = [DEMO_SUBSCRIPTION, ...otherSubs];

    const existingStaffIds = new Set((db.staffMembers as Array<{ id: string }>).map((s) => s.id));
    for (const s of DEMO_STAFF) {
      if (!existingStaffIds.has(s.id)) (db.staffMembers as unknown[]).push(s);
    }

    // Merge demo clinical records if empty
    if ((db.patients as unknown[]).length === 0) db.patients = [...DEMO_PATIENTS];
    if ((db.appointments as unknown[]).length === 0) db.appointments = [...DEMO_APPOINTMENTS];
    if ((db.whatsappThreads as unknown[]).length === 0) db.whatsappThreads = [...DEMO_WHATSAPP_THREADS];
    if ((db.voiceCalls as unknown[]).length === 0) db.voiceCalls = [...DEMO_VOICE_CALLS];
    if ((db.labReports as unknown[]).length === 0) db.labReports = [...DEMO_LAB_REPORTS];
    if ((db.feedback as unknown[]).length === 0) db.feedback = [...DEMO_FEEDBACK];
    if ((db.workflows as unknown[]).length === 0) db.workflows = [...DEMO_WORKFLOWS];

    writeDb(db);
  }

  return NextResponse.json({ success: true, message: 'Demo data active' });
}
