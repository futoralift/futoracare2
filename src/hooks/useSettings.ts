import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/store/toastStore';

interface HospitalSettings {
  llmModel: string;
  whatsappPersona: string;
  voiceAccent: string;
  voiceProvider: string;
  webhookUrl: string;
  webhookSecret: string;
  autoApologyEnabled: boolean;
  emergencyEscalation: boolean;
}

export function useSettings() {
  const queryClient = useQueryClient();

  const query = useQuery<HospitalSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const json = await res.json();
      return json.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<HospitalSettings>) => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings Saved', 'AI model and webhook configurations updated.');
    },
    onError: (err: Error) => {
      toast.error('Save Failed', err.message);
    },
  });

  return {
    ...query,
    updateSettings: updateMutation.mutate,
    isSaving: updateMutation.isPending,
  };
}
