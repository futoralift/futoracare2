# Futoracare AI OS – Technical Specification Document

**Document Reference:** TECH-SPEC-FUTORA-2026  
**Version:** 3.0  
**Stack:** Next.js (App Router), React 19, TypeScript, Vanilla CSS, REST API, Webhooks  

---

## 1. System Overview & Architecture

Futoracare AI OS is structured around an event-driven, multi-tenant SaaS architecture designed to scale seamlessly across hundreds of hospital installations.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Presentation Layer                       │
│  - AppShell (Viewport Root, Hard Screen Lock Guard)                    │
│  - LandingPageView (Public SaaS, Pricing Tiers, Social Proof)          │
│  - SuperAdminView (Master Tenant Console, ARR/MRR Metrics)             │
│  - Clinical Modules (Doctor, Receptionist, Lab Tech, Nurse, Owner)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Client State Layer (Zustand)                    │
│  - uiStore: Auth, Active Tenant, Role, Subscription, Trial Status      │
│  - Screen Lock Flag: isSubscriptionLocked = true on trial expiry       │
│  - Feature Gates: whatsappAiEnabled, moduleAccessFilters               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON API
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Server & API Handlers                           │
│  - /api/tenants, /api/staff, /api/patients, /api/opd, /api/invoices    │
│  - /api/subscription/checkout (Plan selection & Trial Enrollment)      │
│  - /api/subscription/unlock (Autopay mandate execution & screen unlock)│
│  - /api/webhooks/payment (UPI Autopay & e-Mandate Lifecycle events)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                     Persistence & Integration Layer                    │
│  - Multi-tenant Repository Layer (tenantId isolated querying)          │
│  - Payment Gateway Subscriptions Engine (Razorpay / Cashfree / Stripe) │
│  - WhatsApp Business Cloud API (Meta Graph API / Webhooks)             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 7-Day Free Trial & Hard Screen Lock State Machine

### 2.1 State Transitions
1. **Onboarding / Trial Initiation:**
   - When a hospital owner registers and selects **"7-Day Free Trial"**:
     - `subscription.isTrial = true`
     - `subscription.status = 'active'`
     - `subscription.trialEndsAt = Date.now() + 7 days`
     - `subscription.whatsappAiEnabled = false` (Locked)
     - `uiStore.isSubscriptionLocked = false`
2. **Trial In-Progress (Days 1 to 7):**
   - All hospital modules (OPD, IPD, Billing, Staff, Patients) are fully operational.
   - The WhatsApp module functions in view/manual mode, with AI auto-replies disabled and an explanatory upgrade banner visible.
   - Topbar displays `🌟 7-Day Trial Active • 🔒 WhatsApp AI Locked`.
3. **Trial Expiration (Day 8+):**
   - Triggered when `Date.now() > trialEndsAt` or via explicit cancellation/expiry event.
   - `subscription.status = 'expired'`
   - `uiStore.isSubscriptionLocked = true`
   - **Hard Screen Lock Triggered:** `AppShell` detects `isSubscriptionLocked === true` and mounts a full-screen, non-dismissible billing lock modal. Background DOM interactions are disabled.
4. **Payment & Reactivation:**
   - Hospital owner authorizes monthly autopay payment (₹5,000 / ₹8,000 / ₹10,000).
   - `/api/subscription/unlock` generates invoice, activates recurring autopay, and unlocks the screen:
     - `subscription.isTrial = false`
     - `subscription.status = 'active'`
     - `subscription.whatsappAiEnabled = true` (Fully unlocked)
     - `uiStore.isSubscriptionLocked = false`

---

## 3. Recurring Monthly Autopay Architecture (India RBI & NPCI Compliance)

Setting up production recurring monthly autopay in India requires compliance with the **RBI Circular on Processing of e-Mandates for Recurring Transactions** and the **NPCI UPI Autopay Framework**.

### 3.1 What is Required to Enable Monthly Autopay:

1. **Merchant Onboarding & Payment Gateway Account:**
   - A business account with a supported recurring payments gateway:
     - **Razorpay Subscriptions (Recommended)** or **Cashfree Subscriptions**.
     - Requires Indian entity KYC (Certificate of Incorporation/LLP, GSTIN, PAN, Bank Account, Board Resolution).
2. **Payment Gateway Credentials:**
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
3. **Mandate Creation (AFA - Additional Factor of Authentication):**
   - **UPI Autopay:** Customer accepts the mandate on their UPI App (Google Pay, PhonePe, Paytm, BHIM). Requires a ₹0 to ₹2 initial authentication debit (penny drop).
   - **Cards (Visa/Mastercard/RuPay):** 3D-Secure OTP authorization for standing instructions.
   - **e-NACH / Netbanking:** Authenticated via Aadhaar OTP or NetBanking credentials for bank accounts.
4. **Mandatory Pre-Debit Notification (RBI Rule):**
   - RBI strictly mandates that customers must receive an SMS/email notification at least **24 hours prior** to any recurring debit.
   - Razorpay/Cashfree automatically sends this pre-debit SMS on your behalf via their certified notification engine.
5. **Webhook Handlers & Lifecycle Management:**
   - The server must handle asynchronous events:
     - `subscription.charged`: Recurring payment succeeded; extend subscription validity by 30 days.
     - `payment.failed`: Recurring debit failed; trigger grace period warning.
     - `subscription.halted`: Max retries exceeded; trigger **Hard Screen Lock** until manual payment.
     - `subscription.cancelled`: Hospital owner revoked mandate; revert to locked state on period end.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Module / View | Super Admin | Hospital Owner | Doctor | Receptionist | Lab Tech | Nurse |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Super Admin Portal** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **OPD Queue** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Patients List** | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Clinical Prescriptions**| ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Lab Diagnostics** | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Invoices & Billing** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Staff & Roles** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **WhatsApp AI Portal** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Hospital Settings** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Security & Multi-Tenancy Design

1. **Logical Isolation:** Every database entity (`Patient`, `Staff`, `Invoice`, `Appointment`, `Subscription`) includes a mandatory `tenantId` attribute.
2. **Context Guard:** All Next.js API route handlers extract `activeTenantId` from request headers or verified session tokens and reject queries without a matching tenant boundary.
3. **HIPAA & DISHA Preparedness:** Audit logging for patient record access, immutable diagnostic report timestamps, and role-restricted PHI (Protected Health Information) views.
