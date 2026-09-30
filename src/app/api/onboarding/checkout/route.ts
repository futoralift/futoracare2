import { NextRequest } from 'next/server';
import { ok, err } from '@/server/utils/apiResponse';
import { subscriptionService } from '@/server/services/subscriptionService';
import { z } from 'zod';

const CheckoutSchema = z.object({
  hospitalName: z.string().min(3),
  branch: z.string().min(3),
  city: z.string().min(2),
  beds: z.number().min(1).max(5000),
  doctors: z.number().min(1).max(1000),
  ownerName: z.string().min(3),
  ownerEmail: z.string().email(),
  ownerPhone: z.string().min(10),
  ownerDesignation: z.string().default('Owner'),
  plan: z.enum(['starter', 'growth', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']),
  paymentMethod: z.enum(['upi', 'netbanking', 'card']),
  isTrial: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) return err('Validation failed', 400, parsed.error.flatten());

    const result = subscriptionService.checkout(parsed.data);
    return ok(result, 201);
  } catch (e) {
    return err('Checkout failed', 500, e instanceof Error ? e.message : 'Unknown error');
  }
}
