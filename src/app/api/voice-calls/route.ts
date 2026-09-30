import { NextRequest } from 'next/server';
import { VoiceService } from '@/server/services/voiceService';
import { TriggerVoiceCallSchema } from '@/server/validation/schemas';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function GET() {
  const calls = VoiceService.getAll();
  return apiSuccess(calls);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = TriggerVoiceCallSchema.safeParse(body);

    if (!validated.success) {
      return apiError(validated.error.issues.map((i) => i.message).join(', '), 400);
    }

    const created = VoiceService.triggerCall(validated.data);
    return apiSuccess(created, 201);
  } catch {
    return apiError('Failed to trigger voice call', 400);
  }
}
