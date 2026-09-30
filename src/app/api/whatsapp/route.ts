import { AIChatService } from '@/server/services/aiChatService';
import { apiSuccess } from '@/server/utils/apiResponse';

export async function GET() {
  const threads = AIChatService.getThreads();
  return apiSuccess(threads);
}
