import { NextRequest } from 'next/server';
import { ok, err } from '@/server/utils/apiResponse';
import { repository } from '@/server/db/repository';

export async function GET() {
  const tenants = repository.tenants.getAll();
  const subs = repository.subscriptions.getAll();
  const allStaff = repository.staff.getAll();

  const hospitals = tenants.map((t) => {
    const sub = subs.find((s) => s.tenantId === t.id);
    const tenantStaff = allStaff.filter((st) => st.tenantId === t.id);
    return {
      ...t,
      subscription: sub ?? null,
      staffCount: tenantStaff.length,
      staffMembers: tenantStaff,
      monthlyRevenue: sub ? sub.pricePerCycle : 0,
      totalRevenue: sub?.totalPaid ?? 0,
    };
  });

  return ok(hospitals);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { hospitalId, status, extendDays } = body;

    if (!hospitalId) {
      return err('hospitalId is required', 400);
    }

    const tenant = repository.tenants.getById(hospitalId);
    if (!tenant) {
      return err('Hospital not found', 404);
    }

    if (status) {
      repository.tenants.update(hospitalId, { status });
    }

    const sub = repository.subscriptions.getByTenant(hospitalId);
    if (sub && extendDays && typeof extendDays === 'number') {
      const currentEnd = sub.trialEndsAt ? new Date(sub.trialEndsAt) : new Date();
      currentEnd.setDate(currentEnd.getDate() + extendDays);
      repository.subscriptions.update(sub.id, {
        trialEndsAt: currentEnd.toISOString().split('T')[0],
        status: 'trial',
        isTrial: true,
      });
      repository.tenants.update(hospitalId, { status: 'trial' });
    }

    return ok({ message: 'Hospital updated successfully' });
  } catch (_e) {
    return err('Failed to update hospital', 500);
  }
}
