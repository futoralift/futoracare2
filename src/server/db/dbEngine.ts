import fs from 'fs';
import path from 'path';

/**
 * Disk-Persistent Atomic JSON Database Engine for Futoracare.
 * Reads and writes atomically to src/server/db/database.json.
 * Automatically seeds initial data from SEED_DATA on first run.
 */

const DB_PATH = path.resolve(process.cwd(), 'src/server/db/database.json');

export type DatabaseSchema = {
  tenants: unknown[];
  patients: unknown[];
  appointments: unknown[];
  whatsappThreads: unknown[];
  voiceCalls: unknown[];
  labReports: unknown[];
  feedback: unknown[];
  workflows: unknown[];
  staffMembers: unknown[];
  subscriptions: unknown[];
  paymentTransactions: unknown[];
  auditLogs: unknown[];
};

let _cache: DatabaseSchema | null = null;
let _lastMtime = 0;

function ensureDbFile(): void {
  if (!fs.existsSync(DB_PATH)) {
    const seed = getSeedData();
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf-8');
    _cache = seed;
    _lastMtime = Date.now();
  }
}

export function readDb(): DatabaseSchema {
  ensureDbFile();
  try {
    const stat = fs.statSync(DB_PATH);
    if (!_cache || stat.mtimeMs > _lastMtime) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      _cache = JSON.parse(raw) as DatabaseSchema;
      _lastMtime = stat.mtimeMs;
    }
  } catch (_err) {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    _cache = JSON.parse(raw) as DatabaseSchema;
  }
  return _cache;
}

export function writeDb(data: DatabaseSchema): void {
  _cache = data;
  const tempPath = `${DB_PATH}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_PATH);
    _lastMtime = fs.statSync(DB_PATH).mtimeMs;
  } catch (_err) {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch (_) {}
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    _lastMtime = Date.now();
  }
}

export function getCollection<T>(key: keyof DatabaseSchema): T[] {
  return (readDb()[key] as T[]) || [];
}

export function setCollection<T>(key: keyof DatabaseSchema, records: T[]): void {
  const db = readDb();
  (db as Record<string, unknown>)[key] = records;
  writeDb(db);
}

export function insertRecord<T extends { id: string }>(key: keyof DatabaseSchema, record: T): T {
  const db = readDb();
  const collection = (db[key] as T[]) || [];
  collection.push(record);
  (db as Record<string, unknown>)[key] = collection;
  writeDb(db);
  return record;
}

export function updateRecord<T extends { id: string }>(key: keyof DatabaseSchema, id: string, updates: Partial<T>): T | null {
  const db = readDb();
  const collection = (db[key] as T[]) || [];
  const idx = collection.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  collection[idx] = { ...collection[idx], ...updates };
  (db as Record<string, unknown>)[key] = collection;
  writeDb(db);
  return collection[idx];
}

export function deleteRecord(key: keyof DatabaseSchema, id: string): boolean {
  const db = readDb();
  const collection = (db[key] as { id: string }[]) || [];
  const newCollection = collection.filter((r) => r.id !== id);
  if (newCollection.length === collection.length) return false;
  (db as Record<string, unknown>)[key] = newCollection;
  writeDb(db);
  return true;
}

// ─── Seed Data (100% Hindu Indian names) ─────────────────────────────────────

function getSeedData(): DatabaseSchema {
  return {
    tenants: [],
    subscriptions: [],
    staffMembers: [
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
    ],
    patients: [],
    appointments: [],
    whatsappThreads: [],
    voiceCalls: [],
    labReports: [],
    feedback: [],
    workflows: [],
    auditLogs: [],
    paymentTransactions: [],
  };
}
