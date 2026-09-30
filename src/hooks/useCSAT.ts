import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feedback } from '@/types';
import { toast } from '@/store/toastStore';

export function useCSAT() {
  const queryClient = useQueryClient();

  const query = useQuery<Feedback[]>({
    queryKey: ['csat-feedback'],
    queryFn: async () => {
      const res = await fetch('/api/csat');
      if (!res.ok) throw new Error('Failed to fetch CSAT feedback');
      const json = await res.json();
      return json.data;
    },
  });

  const createFeedbackMutation = useMutation({
    mutationFn: async (data: {
      patientName: string;
      rating: 1 | 2 | 3 | 4 | 5;
      emotion: 'delighted' | 'satisfied' | 'neutral' | 'frustrated' | 'angry';
      comment: string;
      department: string;
    }) => {
      const res = await fetch('/api/csat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      const json = await res.json();
      return json.data;
    },
    onSuccess: (feedback) => {
      queryClient.invalidateQueries({ queryKey: ['csat-feedback'] });
      if (feedback.autoApologyDispatched) {
        toast.warning('Auto-Apology Dispatched', 'AI sent an apology message and escalated to Patient Relations.');
      } else {
        toast.success('Feedback Recorded', 'Patient sentiment logged.');
      }
    },
    onError: (err: Error) => {
      toast.error('Feedback Error', err.message);
    },
  });

  return {
    ...query,
    submitFeedback: createFeedbackMutation.mutate,
    isSubmitting: createFeedbackMutation.isPending,
  };
}
