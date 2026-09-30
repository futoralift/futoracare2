# Futoracare AI OS — Database Schema & Prisma ORM Specification

## 1. Schema Architecture Overview
The Futoracare data layer is designed for PostgreSQL with **Row-Level Security (RLS)** to provide tenant data isolation across hospital branches, departments, and clinical roles.

---

## 2. Prisma Schema Definition (`schema.prisma`)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum TenantPlan {
  starter
  growth
  enterprise
}

enum AppointmentStatus {
  confirmed
  pending
  completed
  missed
  cancelled
}

enum RiskLevel {
  low
  medium
  high
  critical
}

enum SentimentType {
  positive
  neutral
  negative
}

enum CallStatus {
  completed
  missed
  in_progress
  scheduled
}

enum MessageRole {
  patient
  ai
  staff
}

model Tenant {
  id           String        @id @default(cuid())
  name         String
  branch       String
  city         String
  beds         Int           @default(100)
  doctors      Int           @default(20)
  plan         TenantPlan    @default(starter)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  patients     Patient[]
  appointments Appointment[]
  voiceCalls   VoiceCall[]
  labReports   LabReport[]
  feedbacks    Feedback[]

  @@map("tenants")
}

model Patient {
  id            String        @id @default(cuid())
  tenantId      String
  name          String
  age           Int
  gender        String
  bloodGroup    String
  phone         String
  email         String?
  riskLevel     RiskLevel     @default(low)
  diagnosis     String
  consultations Int           @default(1)
  tags          String[]      @default([])
  bp            String?       @default("120/80")
  pulse         Int?          @default(72)
  spo2          Int?          @default(98)
  temp          String?       @default("98.6°F")
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  tenant        Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  appointments  Appointment[]
  labReports    LabReport[]

  @@index([tenantId])
  @@index([phone])
  @@index([riskLevel])
  @@map("patients")
}

model Appointment {
  id          String            @id @default(cuid())
  tenantId    String
  patientId   String
  patientName String
  doctorName  String
  department  String
  date        String
  time        String
  type        String            @default("in-person")
  status      AppointmentStatus @default(confirmed)
  notes       String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  tenant      Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  patient     Patient           @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([date])
  @@index([status])
  @@map("appointments")
}

model WhatsAppThread {
  id          String        @id @default(cuid())
  tenantId    String
  patientName String
  phone       String
  lastMessage String
  lastTime    String
  unread      Int           @default(0)
  status      String        @default("ai-handling")
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  messages    ChatMessage[]

  @@index([tenantId])
  @@index([phone])
  @@map("whatsapp_threads")
}

model ChatMessage {
  id        String        @id @default(cuid())
  threadId  String
  role      MessageRole
  content   String        @db.Text
  sentiment SentimentType @default(positive)
  createdAt DateTime      @default(now())

  thread    WhatsAppThread @relation(fields: [threadId], references: [id], onDelete: Cascade)

  @@index([threadId])
  @@map("chat_messages")
}

model VoiceCall {
  id          String        @id @default(cuid())
  tenantId    String
  patientName String
  phone       String
  purpose     String
  duration    String
  status      CallStatus    @default(completed)
  aiHandled   Boolean       @default(true)
  sentiment   SentimentType @default(positive)
  date        String
  time        String
  createdAt   DateTime      @default(now())

  tenant      Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("voice_calls")
}

model LabReport {
  id          String    @id @default(cuid())
  tenantId    String
  patientId   String
  patientName String
  testName    String
  date        String
  status      String    @default("normal")
  results     Json
  aiSummary   String?   @db.Text
  dispatched  Boolean   @default(false)
  createdAt   DateTime  @default(now())

  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  patient     Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("lab_reports")
}

model Feedback {
  id                    String        @id @default(cuid())
  tenantId              String
  patientName           String
  rating                Int
  emotion               String
  comment               String        @db.Text
  date                  String
  department            String
  autoApologyDispatched Boolean       @default(false)
  sentiment             SentimentType @default(positive)
  createdAt             DateTime      @default(now())

  tenant                Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([rating])
  @@map("feedback")
}
```
