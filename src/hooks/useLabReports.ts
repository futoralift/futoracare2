import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LabReport } from '@/types';
import { toast } from '@/store/toastStore';

export function useLabReports() {
  const queryClient = useQueryClient();

  const query = useQuery<LabReport[]>({
    queryKey: ['lab-reports'],
    queryFn: async () => {
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error('Failed to fetch lab reports');
      const json = await res.json();
      return json.data;
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reports/${id}/dispatch`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to dispatch report PDF');
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-reports'] });
      toast.success('Report PDF Dispatched', 'Patient received verified diagnostic summary via WhatsApp.');
    },
    onError: (err: Error) => {
      toast.error('Dispatch Failed', err.message);
    },
  });

  return {
    ...query,
    dispatchToWhatsApp: dispatchMutation.mutate,
    isDispatching: dispatchMutation.isPending,
  };
}
