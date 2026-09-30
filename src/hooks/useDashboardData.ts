import { useQuery } from '@tanstack/react-query';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      const json = await res.json();
      return json.data;
    },
    staleTime: 10_000,
  });
}
