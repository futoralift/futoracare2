# Futoracare AI OS — Architecture & System Design

## 1. Overview
Futoracare is a modern, multi-tenant Healthcare CRM and Hospital Automation Platform built on Next.js App Router, React 19, TypeScript, Tailwind CSS, TanStack Query, and Zustand. It serves hospitals, diagnostic centers, and multi-specialty clinics by streamlining patient engagement, omnichannel AI communication (WhatsApp and Voice calls), diagnostic laboratory reporting, electronic health records (360° EHR), and staff workflows.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
  User[Doctor / Hospital Admin / Care Coordinator] -->|HTTPS| NextApp[Next.js 16 App Router UI & AppShell]
  Patient[Patient via WhatsApp / Phone] -->|Webhooks / Voice Gateway| NextAPI[Next.js API Layer /api/*]

  subgraph Frontend Layer
    NextApp --> Zustand[Zustand Stores (UI, Theme, Toasts)]
    NextApp --> TanStack[TanStack Query Cache]
    NextApp --> Modals[Interactive Modals (Appointment, Patient, Voice, Lab)]
    NextApp --> Recharts[Recharts Real-time Analytics]
  end

  subgraph Server & API Layer
    TanStack -->|REST / JSON| NextAPI
    NextAPI --> Zod[Zod Validation Schemas]
    Zod --> Services[Business Service Layer]
    Services --> AptService[AppointmentService]
    Services --> PatService[PatientService]
    Services --> ChatService[AIChatService & Triage]
    Services --> VoiceService[VoiceService]
    Services --> LabService[LabReportService]
    Services --> CSATService[CSATService & Auto-Apology]
    Services --> WfService[WorkflowService / BullMQ]
  end

  subgraph Data Layer & Multi-Tenancy
    Services --> Repo[Multi-Tenant Database Repository]
    Repo --> DB[(PostgreSQL + RLS Multi-Tenant Isolation)]
    Repo --> Redis[(Redis Queue & Cache)]
  end
```

---

## 3. Core Architectural Modules

### 3.1 Multi-Tenant Isolation Architecture
- **Tenant Context**: Every medical record, appointment, and consultation is associated with a `tenant_id` (e.g. *Futoracare City Hospital Main*, *Futoracare Diagnostics*).
- **Row-Level Security (RLS)**: Enforces database-level isolation so clinic staff cannot view records from other branches without super-admin privileges.

### 3.2 Omnichannel AI Orchestration Engine
1. **WhatsApp Cloud API Agent**:
   - Handles incoming patient inquiries (booking, rescheduling, report delivery, doctor schedules).
   - Clinical emergency keyword detection (`chest pain`, `breathing distress`, `unconscious`) instantly triggers priority alert dispatch and prompts the patient to contact the emergency line or proceed to the ER.
2. **AI Voice Calling Gateway**:
   - Automated outbound reminder calls with synthesized multi-lingual voice accents (English India, Hindi, Telugu).
   - Generates real-time audio waveform logs and transcripts with sentiment scoring.
3. **Diagnostic Lab AI Summarizer**:
   - Automatically inspects measured biomarkers against standard reference ranges.
   - Generates clinical narrative summaries and flags abnormal parameters (`H`, `L`, `HH`, `LL`).

### 3.3 Background Job Processing (BullMQ & Redis)
- Asynchronous task execution for 24-hour appointment reminder sequences, post-op checkup sequences, and auto-apology dispatch for CSAT ratings $\le 2$.

---

## 4. Technology Stack Specification

| Tier | Technologies |
|---|---|
| **Frontend UI** | Next.js 16.3.3, React 19, TypeScript 5, Tailwind CSS v4 |
| **State & Cache** | Zustand v5 (Persisted UI store), TanStack React Query v5 |
| **Data Visualization** | Recharts v3 (Bar, Donut, Area, and Line charts) |
| **Icons & Design Tokens** | Lucide React, Curated HSL Light & Dark CSS Tokens |
| **API & Backend** | Next.js App Router API Routes, Zod Validation |
| **Data Layer** | PostgreSQL with Row-Level Security (Prisma ORM schema) |
| **Job Queue & Cache** | Redis + BullMQ workers |
| **Testing** | Automated service and validation test runner |
