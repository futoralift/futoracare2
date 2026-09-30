import { NextRequest } from 'next/server';
import { subscriptionService } from '@/server/services/subscriptionService';
import { ok, err } from '@/server/utils/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantId = body.tenantId;
    if (!tenantId) {
      return err('tenantId is required', 400);
    }
    const updated = subscriptionService.payAndUnlock(tenantId);
    if (!updated) {
      return err('Subscription not found for this tenant', 404);
    }
    return ok({
      message: 'Payment completed successfully. Portal and WhatsApp AI unlocked.',
      subscription: updated,
    });
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Payment unlock failed', 500);
  }
}
