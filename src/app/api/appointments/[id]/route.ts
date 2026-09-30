import { NextRequest } from 'next/server';
import { AppointmentService } from '@/server/services/appointmentService';
import { UpdateAppointmentStatusSchema } from '@/server/validation/schemas';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateAppointmentStatusSchema.safeParse(body);

    if (!validated.success) {
      return apiError(validated.error.issues.map((i) => i.message).join(', '), 400);
    }

    const updated = AppointmentService.updateStatus(id, validated.data.status);
    if (!updated) {
      return apiError(`Appointment with id ${id} not found`, 404);
    }

    return apiSuccess(updated);
  } catch {
    return apiError('Failed to update appointment', 400);
  }
}
