import { NextRequest } from 'next/server';
import { ok, err } from '@/server/utils/apiResponse';
import { staffService } from '@/server/services/staffService';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = staffService.getById(id);
  if (!staff) return err('Staff member not found', 404);
  return ok(staff);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = staffService.update(id, body);
  if (!updated) return err('Staff member not found', 404);
  return ok(updated);
}
