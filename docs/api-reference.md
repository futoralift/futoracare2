# Futoracare AI OS — REST API Reference

All API responses follow the uniform response structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-09-01T08:00:00.000Z"
}
```

---

## 1. Dashboard & Statistics

### `GET /api/stats`
Returns aggregated KPI counts, today's queue summary, and weekly activity volume.
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "stats": [
        { "label": "Today's Appointments", "value": 47, "change": 12, "icon": "Calendar", "color": "#2563eb", "bg": "#eff6ff" },
        { "label": "Active Patients", "value": 1284, "change": 8, "icon": "Users", "color": "#10b981", "bg": "#f0fdf4" }
      ],
      "statusCounts": { "confirmed": 24, "completed": 15, "pending": 5, "missed": 3 },
      "weeklyVolume": [ ... ],
      "deptVolume": [ ... ]
    }
  }
  ```

---

## 2. Appointments

### `GET /api/appointments`
List all appointments with optional filtering.
- **Query Parameters**:
  - `status` (optional): `confirmed` | `pending` | `completed` | `missed` | `cancelled`
  - `search` (optional): Patient name or doctor name query.

### `POST /api/appointments`
Book a new appointment.
- **Request Body**:
  ```json
  {
    "patientName": "Rajesh Verma",
    "doctorName": "Dr. Arun Mehta",
    "department": "Endocrinology",
    "date": "2026-09-05",
    "time": "10:30 AM",
    "type": "in-person",
    "notes": "Follow-up consultation"
  }
  ```

### `PATCH /api/appointments/:id`
Update status of an appointment.
- **Request Body**:
  ```json
  {
    "status": "completed"
  }
  ```

---

## 3. Patients (360° EHR)

### `GET /api/patients`
List registered patients with risk stratification.
- **Query Parameters**:
  - `risk` (optional): `low` | `medium` | `high` | `critical`
  - `search` (optional): Query string.

### `POST /api/patients`
Register a new patient into the 360° EHR directory.
- **Request Body**:
  ```json
  {
    "name": "Priya Sundaram",
    "age": 45,
    "gender": "Female",
    "bloodGroup": "B+",
    "phone": "+91 98400 12345",
    "email": "priya.s@gmail.com",
    "riskLevel": "low",
    "diagnosis": "Type 2 Diabetes Mellitus",
    "tags": ["Diabetic", "Regular Follow-up"],
    "vitals": {
      "bp": "120/80",
      "pulse": 72,
      "spo2": 98,
      "temp": "98.6°F"
    }
  }
  ```

---

## 4. WhatsApp AI Agent

### `GET /api/whatsapp`
Retrieve all active conversation threads with unread counters.

### `POST /api/whatsapp/messages`
Send message to a patient thread and trigger clinical AI triage.
- **Request Body**:
  ```json
  {
    "threadId": "w1",
    "content": "Can I reschedule my appointment tomorrow?",
    "role": "patient"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "patientMsg": { "id": "m123", "role": "patient", "content": "..." },
      "aiReply": { "id": "m124", "role": "ai", "content": "Sure! Which date and time slot works best for you?" }
    }
  }
  ```

---

## 5. AI Voice Calls

### `GET /api/voice-calls`
List call logs, durations, sentiment tags, and transcript lines.

### `POST /api/voice-calls`
Initiate an outbound automated AI phone call.
- **Request Body**:
  ```json
  {
    "patientName": "Ramesh Chandra",
    "phone": "+91 98400 12345",
    "purpose": "Appointment Reminder (English India)",
    "aiHandled": true
  }
  ```

---

## 6. Diagnostic Lab Reports

### `GET /api/reports`
List all diagnostic lab panels with biomarker flags.

### `POST /api/reports`
Upload lab test panel and generate AI narrative.
- **Request Body**:
  ```json
  {
    "patientName": "Suresh Patel",
    "testName": "Lipid Profile",
    "date": "2026-09-01",
    "results": [
      { "parameter": "Total Cholesterol", "value": "240", "unit": "mg/dL", "referenceRange": "< 200", "flag": "H" }
    ]
  }
  ```

### `POST /api/reports/:id/dispatch`
Dispatch lab summary PDF directly to patient WhatsApp.

---

## 7. Global Search (Omnibar)

### `GET /api/search?q=:query`
Unified search endpoint across Patients, Doctors, Appointments, and System Actions.
