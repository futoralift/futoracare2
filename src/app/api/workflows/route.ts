import { NextRequest } from 'next/server';
import { WorkflowService } from '@/server/services/workflowService';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function GET() {
  const workflows = WorkflowService.getAll();
  return apiSuccess(workflows);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.workflowName || !body.trigger) {
      return apiError('workflowName and trigger are required', 400);
    }
    const created = WorkflowService.create({
      workflowName: body.workflowName,
      trigger: body.trigger,
      nodes: body.nodes || 3,
    });
    return apiSuccess(created, 201);
  } catch {
    return apiError('Failed to create workflow', 400);
  }
}
