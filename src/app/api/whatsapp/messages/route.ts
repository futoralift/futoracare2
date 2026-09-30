import { NextRequest } from 'next/server';
import { AIChatService } from '@/server/services/aiChatService';
import { SendWhatsAppMessageSchema } from '@/server/validation/schemas';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = SendWhatsAppMessageSchema.safeParse(body);

    if (!validated.success) {
      return apiError(validated.error.issues.map((i) => i.message).join(', '), 400);
    }

    const { threadId, content, role } = validated.data;
    const result = AIChatService.processMessage(threadId, content, role as 'patient' | 'staff');

    return apiSuccess(result, 201);
  } catch {
    return apiError('Failed to process message', 400);
  }
}
