import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkflowLog } from '@/types';
import { toast } from '@/store/toastStore';

export function useWorkflows() {
  const queryClient = useQueryClient();

  const query = useQuery<WorkflowLog[]>({
    queryKey: ['workflows'],
    queryFn: async () => {
      const res = await fetch('/api/workflows');
      if (!res.ok) throw new Error('Failed to fetch workflows');
      const json = await res.json();
      return json.data;
    },
  });

  const rerunMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workflows/${id}/rerun`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to re-run workflow');
      const json = await res.json();
      return json.data;
    },
    onSuccess: (wf) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.info('Workflow Dispatched', `${wf.workflowName} job triggered on BullMQ queue.`);
    },
    onError: (err: Error) => {
      toast.error('Trigger Failed', err.message);
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: { workflowName: string; trigger: string; nodes: number }) => {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create workflow');
      const json = await res.json();
      return json.data;
    },
    onSuccess: (wf) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow Created', `${wf.workflowName} is now active.`);
    },
    onError: (err: Error) => {
      toast.error('Creation Failed', err.message);
    },
  });

  return {
    ...query,
    rerunWorkflow: rerunMutation.mutate,
    createWorkflow: createWorkflowMutation.mutate,
    isRerunning: rerunMutation.isPending,
  };
}
