import { useQuery } from '@tanstack/react-query';
import { Tenant } from '@/types';
export function useTenants() {
  const query = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await fetch('/api/tenants');
      if (!res.ok) throw new Error('Failed to fetch tenants');
      const json = await res.json();
      return json.data;
    },
    staleTime: 30_000,
  });

  return {
    ...query,
    tenants: query.data || [],
  };
}
