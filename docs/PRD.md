# Futoracare AI OS – Product Requirements Document (PRD)

**Version:** 2.4  
**Date:** September 2026  
**Status:** Approved & Production-Ready  
**Domain:** Healthcare AI SaaS & Hospital Operating System (India)  

---

## 1. Executive Summary & Vision

**Futoracare AI OS** is a multi-tenant, cloud-native Hospital Operating System engineered specifically for Indian private hospitals, nursing homes, and polyclinics (10 to 200+ beds). 

It consolidates clinical workflows, OPD/IPD management, automated WhatsApp patient engagement, electronic health records (ABDM/M1-M3 compliant), billing, pharmacy, and laboratory into an intelligent, autonomous operating suite.

---

## 2. Core Business Model & Commercial Terms

### 2.1 Pricing Tiers (INR / Month)
- **Starter (₹5,000 / month):** Up to 20 beds, 3 staff seats, OPD token queue, WhatsApp reminders, core billing.
- **Growth (₹8,000 / month):** Up to 60 beds, 10 staff seats, full IPD/OT/ICU management, Lab & Pharmacy POS, WhatsApp triage AI.
- **Enterprise (₹10,000 / month):** Unlimited beds, unlimited staff accounts, custom ABDM gateway integration, Super Admin analytics, automated multi-doctor scheduling.

### 2.2 7-Day Free Trial & WhatsApp AI Lock Rule
1. **7-Day Free Trial Availability:**
   - Any new hospital owner can sign up and onboard without an immediate upfront subscription payment.
   - Hospital owners receive 7 calendar days of full access to clinical, IPD/OPD, billing, and staff management modules.
2. **WhatsApp AI Auto-Responder Gating:**
   - **Crucial Rule:** Automated WhatsApp AI triage & messaging are strictly locked during the 7-day free trial to prevent WhatsApp Meta API misuse and high LLM token costs before payment commitment.
   - The WhatsApp portal displays a clear security banner explaining that automated sending is locked until the first monthly autopay charge is processed.
3. **Post-Trial Hard Screen Lock:**
   - On Day 8 (or immediately when the trial period concludes), the entire portal enters a **Hard Screen Lock** state.
   - The application viewport is blocked by a non-dismissible modal displaying invoice details, breakdown of monthly fee, and authorization for monthly recurring autopay.
   - All navigation, clinical writes, and reads are inaccessible until payment is completed.
4. **Monthly Autopay Mandate:**
   - On payment, the hospital owner authorizes a monthly recurring autopay mandate (via UPI Autopay or e-Mandate) scheduled to debit automatically every 30 days.

---

## 3. User Personas & Role-Based Access Control (RBAC)

### 3.1 Personas
| Role | Responsibility | Module Access |
| :--- | :--- | :--- |
| **Super Admin (Platform Owner)** | Master cross-tenant oversight, tenant onboarding status, ARR/MRR metrics, system health | Super Admin Dashboard, All Tenants, Revenue Analytics, System Audit |
| **Hospital Owner (Tenant Admin)** | Hospital governance, plan subscription, autopay settings, staff role assignment | Full access within tenant: Dashboard, Staff, Billing, Settings, Clinical |
| **Doctor** | Patient examination, e-Prescriptions, clinical notes, lab reviews | Patients, OPD Queue, Prescriptions, Lab Results, AI Clinical Copilot |
| **Receptionist** | Patient registration, OPD appointment scheduling, fee collection, token generation | Patients, OPD Queue, Appointments, Invoices, WhatsApp Follow-ups |
| **Lab Technician** | Sample processing, diagnostic test entry, critical alert dispatch | Lab module, diagnostic reports, sample tracking |
| **Nurse** | Bed allocation, vital signs monitoring, medication administration | IPD wards, vitals recording, nursing notes |

### 3.2 Access Rule
- The platform operates on a **zero-trust navigation model**. If a user does not have permission for a module or has not completed subscription payment, access is immediately blocked with appropriate UI fallbacks.

---

## 4. Key Functional Modules

### 4.1 Hospital Owner Onboarding & Plan Selection
- Self-serve onboarding dialog mounted at center viewport.
- Multi-step wizard:
  1. Hospital Identity (Name, Address, Registration No., Bed Count).
  2. Plan & Billing Selection (Starter ₹5k / Growth ₹8k / Enterprise ₹10k).
  3. Trial Option (7-Day Trial vs Instant Paid Activation).
  4. Staff Role Definition & Provisioning.

### 4.2 Super Admin Master Console
- Accessible only to platform owners via `Super Admin Portal`.
- Metrics: Active Hospitals, Monthly Recurring Revenue (MRR), Active Beds, WhatsApp Auto-Resolution Rate.
- Cross-hospital switcher with tenant-level metrics and one-click impersonation/audit.

### 4.3 OPD & Token Queue Management
- Live token queue with status badges (Waiting, In Consultation, Completed, Cancelled).
- Doctor assignment, consultation timer, and audio token announcements.

### 4.4 Automated WhatsApp Patient Engagement
- Pre-consultation intake, appointment reminders, lab result PDF delivery, and post-discharge follow-ups.
- Locked during the 7-day trial; unlocked instantly upon paid subscription.

### 4.5 Invoicing, Billing & Pharmacy POS
- GST-compliant invoices with CGST/SGST breakdowns.
- Integration with inventory deduction for pharmacy items and diagnostic fee schedules.

---

## 5. Non-Functional & Compliance Requirements

1. **Naming Conventions:** All sample, mock, and seed data must strictly feature authentic Indian Hindu names (e.g., Dr. Ramesh Sharma, Sunita Devi, Rajesh Patel) reflecting Indian healthcare demographics.
2. **Theme Standards:** Light theme default for clinical clarity and readability in high-ambient-light hospital OPD environments.
3. **ABDM Compliance:** Architecture ready for Ayushman Bharat Digital Mission (ABHA Creation, Health Records M1, M2, M3 APIs).
4. **Data Isolation:** Complete logical tenant separation using `tenantId` indexed filtering on all read/write operations.
