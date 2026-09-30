import { db } from '@/server/db/repository';
import { Patient, RiskLevel } from '@/types';

export class PatientService {
  static getAll(search?: string, riskLevel?: string): Patient[] {
    return db.getPatients(search, riskLevel);
  }

  static getById(id: string): Patient | undefined {
    return db.getPatientById(id);
  }

  static create(data: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup: string;
    phone: string;
    email?: string;
    riskLevel?: RiskLevel;
    diagnosis: string;
    tags?: string[];
    vitals?: { bp: string; pulse: number; spo2: number; temp: string };
  }): Patient {
    // Determine risk level based on clinical vitals and tags if not explicitly set
    let calculatedRisk = data.riskLevel || 'low';
    if (data.vitals) {
      if (data.vitals.spo2 < 92 || data.vitals.pulse > 110) {
        calculatedRisk = 'critical';
      } else if (data.vitals.spo2 < 95 || data.vitals.pulse > 95) {
        calculatedRisk = 'high';
      }
    }

    return db.createPatient({
      ...data,
      email: data.email || undefined,
      riskLevel: calculatedRisk,
      tags: data.tags && data.tags.length > 0 ? data.tags : ['New Patient', 'Clinical Intake'],
    });
  }

  static update(id: string, updates: Partial<Patient>): Patient | null {
    return db.updatePatient(id, updates);
  }
}
