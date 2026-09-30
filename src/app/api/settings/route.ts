import { NextRequest } from 'next/server';
import { db } from '@/server/db/repository';
import { UpdateSettingsSchema } from '@/server/validation/schemas';
import { apiSuccess, apiError } from '@/server/utils/apiResponse';

export async function GET() {
  const settings = db.getSettings();
  return apiSuccess(settings);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = UpdateSettingsSchema.safeParse(body);

    if (!validated.success) {
      return apiError(validated.error.issues.map((i) => i.message).join(', '), 400);
    }

    const updated = db.updateSettings(validated.data);
    return apiSuccess(updated);
  } catch {
    return apiError('Failed to update settings', 400);
  }
}
