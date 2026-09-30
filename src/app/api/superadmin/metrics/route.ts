import { ok } from '@/server/utils/apiResponse';
import { repository } from '@/server/db/repository';

export async function GET() {
  const metrics = repository.superAdmin.getMetrics();
  return ok(metrics);
}
