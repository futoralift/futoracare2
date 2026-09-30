import { NextRequest } from 'next/server';
import { AppointmentService } from '@/server/services/appointmentService';
import { CreateAppointmentSchema } from '@/server/validation/schemas';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const appointments = AppointmentService.getAll(status, search);
  return apiSuccess(appointments);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateAppointmentSchema.safeParse(body);

    if (!validated.success) {
      return apiError(validated.error.issues.map((i) => i.message).join(', '), 400);
    }

    const created = AppointmentService.create(validated.data);
    return apiSuccess(created, 201);
  } catch {
    return apiError('Failed to parse request payload', 400);
  }
}
