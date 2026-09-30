# Futoracare AI OS — Developer Setup Guide

## 1. Quickstart

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Step 3: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm test` | Runs the automated service, triage, and validation test suite |
| `npm run build` | Compiles an optimized production build |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint analysis |

---

## 3. Project Structure

```
src/
├── app/
│   ├── api/                 # Next.js REST API routes
│   │   ├── appointments/    # Appointment booking & status transitions
│   │   ├── patients/        # 360° EHR patient records
│   │   ├── whatsapp/        # WhatsApp AI triage & chat
│   │   ├── voice-calls/     # Outbound AI voice calling
│   │   ├── reports/         # Diagnostic lab analysis & dispatch
│   │   ├── csat/            # CSAT feedback & auto-apologies
│   │   ├── workflows/       # BullMQ workflow management
│   │   ├── stats/           # Aggregated KPI stats & charts
│   │   ├── settings/        # Multi-tenant & AI model settings
│   │   └── search/          # Global Omnibar search
│   ├── globals.css          # Design system & CSS tokens
│   ├── layout.tsx           # Root layout with fonts & providers
│   └── page.tsx             # Active view router
├── components/
│   ├── layout/              # AppShell, Sidebar, Topbar
│   ├── dashboard/           # KPIs, AI Hero Banner, Queue, Charts
│   ├── appointments/        # Appointments table & tab filters
│   ├── patients/            # Patient directory & 360 EHR modal
│   ├── whatsapp/            # 2-way AI chat & staff takeover
│   ├── voice/               # Voice calls console & waveform
│   ├── reports/             # Lab reports & flag table
│   ├── csat/                # CSAT sentiment breakdown
│   ├── analytics/           # Recharts department & activity charts
│   ├── workflows/           # BullMQ workflow execution logs
│   ├── settings/            # Tenant, LLM, voice & webhook settings
│   ├── modals/              # Interactive creation & search modals
│   └── ui/                  # Toast container, skeletons, error boundary
├── hooks/                   # TanStack React Query custom hooks
├── server/
│   ├── db/                  # Thread-safe multi-tenant repository
│   ├── services/            # Core business logic services
│   ├── validation/          # Zod request validation schemas
│   └── utils/               # Uniform API response helpers
├── store/                   # Zustand stores (UI, theme, toasts)
└── types/                   # Domain TypeScript definitions
```
