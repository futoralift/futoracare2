import { StaffMember, StaffRole, AppModule, ROLE_PERMISSIONS } from '@/types';
import { repository } from '@/server/db/repository';
import { nanoid } from '@/server/utils/nanoid';

export const staffService = {
  getByTenant: (tenantId: string): StaffMember[] => {
    return repository.staff.getByTenant(tenantId);
  },

  getById: (id: string): StaffMember | undefined => {
    return repository.staff.getById(id);
  },

  create: (tenantId: string, payload: {
    name: string;
    email: string;
    phone: string;
    role: StaffRole;
    department?: string;
    customPermissions?: AppModule[];
  }): StaffMember => {
    const staff: StaffMember = {
      id: nanoid('staff'),
      tenantId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      department: payload.department,
      customPermissions: payload.customPermissions,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      avatarInitials: payload.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2),
    };
    return repository.staff.insert(staff);
  },

  update: (id: string, updates: Partial<Omit<StaffMember, 'id' | 'tenantId'>>): StaffMember | null => {
    return repository.staff.update(id, updates);
  },

  getPermissions: (id: string): AppModule[] => {
    const staff = repository.staff.getById(id);
    if (!staff) return [];
    return staff.customPermissions ?? ROLE_PERMISSIONS[staff.role] ?? [];
  },
};
