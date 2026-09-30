import { db } from '@/server/db/repository';
import { LabReport, LabResult } from '@/types';

export class LabReportService {
  static getAll(): LabReport[] {
    return db.getLabReports();
  }

  static getById(id: string): LabReport | undefined {
    return db.getLabReportById(id);
  }

  static create(data: {
    patientName: string;
    patientId?: string;
    testName: string;
    date: string;
    results: LabResult[];
    status?: 'normal' | 'abnormal' | 'critical';
    aiSummary?: string;
  }): LabReport {
    // Automatically synthesize an AI summary and flag abnormal values if not provided
    let status = data.status || 'normal';
    const flaggedParams = data.results.filter((r) => r.flag);

    if (flaggedParams.some((r) => r.flag === 'HH' || r.flag === 'LL')) {
      status = 'critical';
    } else if (flaggedParams.length > 0) {
      status = 'abnormal';
    }

    const aiSummary =
      data.aiSummary ||
      (status === 'critical'
        ? `⚠️ CRITICAL: Elevated abnormal flags observed in ${flaggedParams.map((f) => f.parameter).join(', ')}. Immediate specialist consultation required.`
        : status === 'abnormal'
        ? `Mildly abnormal values detected in ${flaggedParams.map((f) => f.parameter).join(', ')}. Dietary monitoring and routine physician follow-up recommended.`
        : `All diagnostic parameters are within normal physiological reference ranges.`);

    return db.createLabReport({
      patientName: data.patientName,
      patientId: data.patientId || 'p1',
      testName: data.testName,
      date: data.date,
      status,
      results: data.results,
      aiSummary,
    });
  }

  static dispatchToWhatsApp(id: string): boolean {
    return db.dispatchLabReport(id);
  }
}
