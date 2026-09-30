import { NextRequest } from 'next/server';
import { ok, err } from '@/server/utils/apiResponse';
import { staffService } from '@/server/services/staffService';
import { z } from 'zod';

const CreateStaffSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  role: z.enum(['hospital_owner', 'doctor', 'receptionist', 'lab_technician', 'care_coordinator']),
  department: z.string().optional(),
  customPermissions: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId') ?? '';
  if (!tenantId) return err('tenantId required', 400);
  const staff = staffService.getByTenant(tenantId);
  return ok(staff);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateStaffSchema.safeParse(body);
    if (!parsed.success) return err('Validation failed', 400, parsed.error.flatten());

    const { tenantId, ...rest } = parsed.data;
    const staff = staffService.create(tenantId, rest as Parameters<typeof staffService.create>[1]);
    return ok(staff, 201);
  } catch (e) {
    return err('Failed to create staff', 500, e instanceof Error ? e.message : 'Unknown');
  }
}
