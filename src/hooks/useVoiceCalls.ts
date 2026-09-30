import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VoiceCall } from '@/types';

export function useVoiceCalls() {
  const queryClient = useQueryClient();

  const query = useQuery<VoiceCall[]>({
    queryKey: ['voice-calls'],
    queryFn: async () => {
      const res = await fetch('/api/voice-calls');
      if (!res.ok) throw new Error('Failed to fetch voice calls');
      const json = await res.json();
      return json.data;
    },
  });

  const triggerCallMutation = useMutation({
    mutationFn: async (data: { patientName: string; phone: string; purpose: string }) => {
      const res = await fetch('/api/voice-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to trigger voice call');
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-calls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return {
    ...query,
    triggerCall: triggerCallMutation.mutate,
    isTriggering: triggerCallMutation.isPending,
  };
}
