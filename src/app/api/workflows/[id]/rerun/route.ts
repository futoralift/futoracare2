import { NextRequest } from 'next/server';
import { WorkflowService } from '@/server/services/workflowService';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rerun = WorkflowService.rerun(id);
  if (!rerun) {
    return apiError(`Workflow with id ${id} not found`, 404);
  }
  return apiSuccess(rerun);
}
