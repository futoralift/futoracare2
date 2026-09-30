import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment, AppointmentStatus } from '@/types';
import { toast } from '@/store/toastStore';

export function useAppointments(status?: string, search?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Appointment[]>({
    queryKey: ['appointments', status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const json = await res.json();
      return json.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const json = await res.json();
      return json.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(
        'Appointment Updated',
        `${updated.patientName}'s appointment marked as ${updated.status}.`
      );
    },
    onError: (err: Error) => {
      toast.error('Update Failed', err.message);
    },
  });

  return {
    ...query,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
}
