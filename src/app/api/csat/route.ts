import { NextRequest } from 'next/server';
import { CSATService } from '@/server/services/csatService';
import { CreateFeedbackSchema } from '@/server/validation/schemas';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function GET() {
  const feedback = CSATService.getAll();
  return apiSuccess(feedback);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateFeedbackSchema.safeParse(body);

    if (!validated.success) {
      return apiError(validated.error.issues.map((i) => i.message).join(', '), 400);
    }

    const created = CSATService.create(validated.data);
    return apiSuccess(created, 201);
  } catch {
    return apiError('Failed to record feedback', 400);
  }
}
