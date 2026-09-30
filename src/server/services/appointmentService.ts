import { db } from '@/server/db/repository';
import { Appointment, AppointmentStatus } from '@/types';

export class AppointmentService {
  static getAll(status?: string, search?: string): Appointment[] {
    return db.getAppointments(status, search);
  }

  static getById(id: string): Appointment | undefined {
    return db.getAppointmentById(id);
  }

  static create(data: {
    patientName: string;
    doctorName: string;
    department: string;
    date: string;
    time: string;
    type?: 'in-person' | 'teleconsult';
    notes?: string;
    patientId?: string;
  }): Appointment {
    // Generate or lookup patient ID
    const patientId = data.patientId || `p_${Date.now()}`;
    return db.createAppointment({
      ...data,
      patientId,
      type: data.type || 'in-person',
    });
  }

  static updateStatus(id: string, status: AppointmentStatus): Appointment | null {
    return db.updateAppointmentStatus(id, status);
  }
}
