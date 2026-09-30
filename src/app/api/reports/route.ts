import { NextRequest } from 'next/server';
import { LabReportService } from '@/server/services/labReportService';
import { CreateLabReportSchema } from '@/server/validation/schemas';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function GET() {
  const reports = LabReportService.getAll();
  return apiSuccess(reports);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateLabReportSchema.safeParse(body);

    if (!validated.success) {
      return apiError(validated.error.issues.map((i) => i.message).join(', '), 400);
    }

    const created = LabReportService.create(validated.data);
    return apiSuccess(created, 201);
  } catch {
    return apiError('Failed to create lab report', 400);
  }
}
