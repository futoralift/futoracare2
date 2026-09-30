import { NextRequest } from 'next/server';
import { LabReportService } from '@/server/services/labReportService';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = LabReportService.dispatchToWhatsApp(id);
  if (!success) {
    return apiError(`Lab report with id ${id} not found`, 404);
  }
  return apiSuccess({ dispatched: true, id, message: 'Report PDF successfully dispatched to patient WhatsApp.' });
}
