import { NextRequest } from 'next/server';
import { PatientService } from '@/server/services/patientService';
import { CreatePatientSchema } from '@/server/validation/schemas';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const risk = searchParams.get('risk') || undefined;

  const patients = PatientService.getAll(search, risk);
  return apiSuccess(patients);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreatePatientSchema.safeParse(body);

    if (!validated.success) {
      return apiError(validated.error.issues.map((i) => i.message).join(', '), 400);
    }

    const created = PatientService.create(validated.data);
    return apiSuccess(created, 201);
  } catch {
    return apiError('Failed to create patient', 400);
  }
}
