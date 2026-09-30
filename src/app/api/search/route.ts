import { NextRequest } from 'next/server';
import { db } from '@/server/db/repository';
import { apiSuccess } from '@/server/utils/apiResponse';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  const results = db.globalSearch(q);
  return apiSuccess(results);
}
