import { NextRequest } from 'next/server';
import { PatientService } from '@/server/services/patientService';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patient = PatientService.getById(id);
  if (!patient) {
    return apiError(`Patient with id ${id} not found`, 404);
  }
  return apiSuccess(patient);
}
