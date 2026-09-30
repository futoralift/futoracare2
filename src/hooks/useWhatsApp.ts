import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WhatsAppThread } from '@/types';
import { toast } from '@/store/toastStore';

export function useWhatsApp() {
  const queryClient = useQueryClient();

  const query = useQuery<WhatsAppThread[]>({
    queryKey: ['whatsapp-threads'],
    queryFn: async () => {
      const res = await fetch('/api/whatsapp');
      if (!res.ok) throw new Error('Failed to fetch WhatsApp threads');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 15_000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ threadId, content, role = 'patient' }: { threadId: string; content: string; role?: 'patient' | 'staff' }) => {
      const res = await fetch('/api/whatsapp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, content, role }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-threads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (err: Error) => {
      toast.error('Message Error', err.message);
    },
  });

  return {
    ...query,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
}
