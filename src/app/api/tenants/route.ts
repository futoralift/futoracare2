import { db } from '@/server/db/repository';
import { apiSuccess } from '@/server/utils/apiResponse';

export async function GET() {
  const tenants = db.getTenants();
  return apiSuccess(tenants);
}
