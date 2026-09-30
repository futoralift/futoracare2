import { NextRequest } from 'next/server';
import { ok, err } from '@/server/utils/apiResponse';

const SUPER_ADMIN_EMAIL = 'madhur@futoragroup.com';
const SUPER_ADMIN_PASSWORD = 'msd@7821';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return err('Email and password are required', 400);
    }

    if (
      email.trim().toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase() ||
      password !== SUPER_ADMIN_PASSWORD
    ) {
      return err('Invalid Super Admin credentials. Access denied.', 401);
    }

    const superAdminUser = {
      id: 'sa_madhur',
      tenantId: 'platform',
      name: 'Madhur',
      email: SUPER_ADMIN_EMAIL,
      phone: '+91 99999 88888',
      role: 'super_admin' as const,
      isActive: true,
      createdAt: '2024-01-01',
      avatarInitials: 'MF',
    };

    return ok({
      authenticated: true,
      user: superAdminUser,
      message: 'Super Admin authenticated successfully',
    });
  } catch (_err) {
    return err('Malformed authentication request', 400);
  }
}
