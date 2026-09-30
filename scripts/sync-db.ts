import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const DB_PATH = path.resolve(process.cwd(), 'src/server/db/database.json');

async function syncAndClean() {
  console.log('🔄 Cleaning JSON Database and syncing PostgreSQL...');

  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  const dbData = JSON.parse(raw);

  // 1. Production Launch Zero-State: 0 mock tenants, 0 mock subscriptions, 0 mock records
  dbData.tenants = [];
  dbData.subscriptions = [];
  dbData.staffMembers = [
    {
      id: 'sa_madhur',
      tenantId: 'platform',
      name: 'Madhur',
      email: 'madhur@futoragroup.com',
      phone: '+91 99999 88888',
      role: 'super_admin',
      isActive: true,
      createdAt: '2024-01-01',
      avatarInitials: 'MF',
    },
  ];
  dbData.patients = [];
  dbData.appointments = [];
  dbData.whatsappThreads = [];
  dbData.voiceCalls = [];
  dbData.labReports = [];
  dbData.feedback = [];
  dbData.workflows = [];
  dbData.auditLogs = [];
  dbData.paymentTransactions = [];

  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
  console.log('✅ database.json set to pristine Launch State (0 tenants, 0 subscriptions, 0 mock clinical data, 1 Super Admin).');

  // 2. Sync to PostgreSQL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/futoracare_db',
  });

  try {
    // Clear all clinical tables in PostgreSQL
    await pool.query('TRUNCATE patients, appointments, whatsapp_threads, voice_calls, lab_reports, feedback, workflows, subscriptions, staff_members, tenants CASCADE');
    console.log('✅ PostgreSQL tables truncated.');

    // Insert Tenants
    for (const t of dbData.tenants || []) {
      await pool.query(
        `INSERT INTO tenants (id, name, branch, city, beds, doctors, plan, status, created_at, owner)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, branch = EXCLUDED.branch, city = EXCLUDED.city,
           beds = EXCLUDED.beds, doctors = EXCLUDED.doctors, plan = EXCLUDED.plan,
           status = EXCLUDED.status, owner = EXCLUDED.owner`,
        [t.id, t.name, t.branch, t.city, t.beds || 0, t.doctors || 0, t.plan || 'starter', t.status || 'active', t.createdAt || '2024-01-01', JSON.stringify(t.owner || {})]
      );
    }
    console.log(`✅ Seeded ${dbData.tenants?.length || 0} genuine tenants into PostgreSQL.`);

    // Insert Staff
    for (const s of dbData.staffMembers || []) {
      await pool.query(
        `INSERT INTO staff_members (id, tenant_id, name, email, phone, role, department, custom_permissions, is_active, created_at, avatar_initials)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.tenantId, s.name, s.email, s.phone, s.role, s.department || null, JSON.stringify(s.customPermissions || null), s.isActive ?? true, s.createdAt || '2024-01-01', s.avatarInitials || null]
      );
    }
    console.log(`✅ Seeded ${dbData.staffMembers?.length || 0} genuine staff into PostgreSQL.`);

    // Insert Subscriptions
    for (const sub of dbData.subscriptions || []) {
      await pool.query(
        `INSERT INTO subscriptions (id, tenant_id, plan, status, billing_cycle, price_per_cycle, start_date, next_renewal, total_paid, is_trial, trial_ends_at, autopay_enabled, autopay_status, autopay_method, whatsapp_ai_enabled, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO NOTHING`,
        [sub.id, sub.tenantId, sub.plan, sub.status, sub.billingCycle || 'monthly', sub.pricePerCycle || 0, sub.startDate || '2024-01-01', sub.nextRenewal || '', sub.totalPaid || 0, sub.isTrial || false, sub.trialEndsAt || null, sub.autopayEnabled || false, sub.autopayStatus || 'inactive', sub.autopayMethod || null, sub.whatsappAiEnabled ?? true, sub.startDate || '2024-01-01']
      );
    }
    console.log(`✅ Seeded ${dbData.subscriptions?.length || 0} subscriptions into PostgreSQL.`);

  } finally {
    await pool.end();
  }
}

syncAndClean().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
