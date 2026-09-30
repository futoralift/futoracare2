-- Futoracare Multi-Tenant Hospital OS PostgreSQL Schema

CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  branch VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  beds INT NOT NULL DEFAULT 0,
  doctors INT NOT NULL DEFAULT 0,
  plan VARCHAR(50) NOT NULL DEFAULT 'starter',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at VARCHAR(50) NOT NULL,
  owner JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS staff_members (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100),
  custom_permissions JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at VARCHAR(50) NOT NULL,
  avatar_initials VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'starter',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
  price_per_cycle NUMERIC NOT NULL DEFAULT 0,
  start_date VARCHAR(50) NOT NULL,
  next_renewal VARCHAR(50) NOT NULL,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  is_trial BOOLEAN NOT NULL DEFAULT false,
  trial_ends_at VARCHAR(50),
  autopay_enabled BOOLEAN NOT NULL DEFAULT false,
  autopay_status VARCHAR(50) NOT NULL DEFAULT 'inactive',
  autopay_method VARCHAR(100),
  whatsapp_ai_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(20) NOT NULL,
  blood_group VARCHAR(10),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  risk_level VARCHAR(50) NOT NULL DEFAULT 'low',
  diagnosis TEXT NOT NULL,
  last_visit VARCHAR(50),
  consultations INT NOT NULL DEFAULT 0,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  vitals JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  patient_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
  type VARCHAR(50) NOT NULL DEFAULT 'in-person',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS whatsapp_threads (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  last_message TEXT NOT NULL,
  last_time VARCHAR(50) NOT NULL,
  unread INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'ai-handling',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voice_calls (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  duration VARCHAR(50) NOT NULL DEFAULT '0m 00s',
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  ai_handled BOOLEAN NOT NULL DEFAULT true,
  sentiment VARCHAR(50) NOT NULL DEFAULT 'neutral',
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_reports (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_id VARCHAR(64),
  test_name VARCHAR(255) NOT NULL,
  date VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'normal',
  dispatched BOOLEAN NOT NULL DEFAULT false,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  emotion VARCHAR(50) NOT NULL,
  comment TEXT NOT NULL,
  date VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  auto_apology_dispatched BOOLEAN NOT NULL DEFAULT false,
  sentiment VARCHAR(50) NOT NULL DEFAULT 'neutral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflows (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  workflow_name VARCHAR(255) NOT NULL,
  trigger VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  duration VARCHAR(50) NOT NULL DEFAULT '–',
  nodes INT NOT NULL DEFAULT 3,
  timestamp VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospital_settings (
  tenant_id VARCHAR(64) PRIMARY KEY,
  llm_model VARCHAR(100) DEFAULT 'gemini-1.5-pro',
  whatsapp_persona TEXT DEFAULT 'Futoracare AI Assistant — friendly, professional healthcare tone',
  voice_accent VARCHAR(50) DEFAULT 'en-IN-female',
  voice_provider VARCHAR(50) DEFAULT 'Twilio Voice',
  webhook_url TEXT DEFAULT 'https://your-hospital.com/webhooks/futoracare',
  webhook_secret VARCHAR(255) DEFAULT 'whk_futoracare_secret_key_xxxx',
  auto_apology_enabled BOOLEAN DEFAULT true,
  emergency_escalation BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_whatsapp_tenant ON whatsapp_threads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_tenant ON voice_calls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_tenant ON lab_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant ON feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflows_tenant ON workflows(tenant_id);
