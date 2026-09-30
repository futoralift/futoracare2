import { useQuery } from '@tanstack/react-query';
import { Patient } from '@/types';

export function usePatients(search?: string, riskLevel?: string) {
  return useQuery<Patient[]>({
    queryKey: ['patients', search, riskLevel],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (riskLevel && riskLevel !== 'all') params.append('risk', riskLevel);

      const res = await fetch(`/api/patients?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch patients');
      const json = await res.json();
      return json.data;
    },
  });
}
