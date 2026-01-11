import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toBrazilIso } from '@/lib/date-br';

type Reminder = Tables<'reminders'>;

export function useReminders(status?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['reminders', user?.id, status],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('remind_at', { ascending: true });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (reminder: Omit<TablesInsert<'reminders'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      let payload = { ...reminder, user_id: user.id };
      if (payload.remind_at) {
        payload.remind_at = toBrazilIso(payload.remind_at);
      }
      const { data, error } = await supabase
        .from('reminders')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'reminders'> & { id: string }) => {
      let payload = { ...updates };
      if (payload.remind_at) {
        payload.remind_at = toBrazilIso(payload.remind_at);
      }
      const { data, error } = await supabase
        .from('reminders')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const reminders = query.data || [];
  const pendingCount = reminders.filter((r) => r.status === 'pending').length;
  const sentCount = reminders.filter((r) => r.status === 'sent' || r.status === 'completed').length;

  return {
    reminders,
    isLoading: query.isLoading,
    error: query.error,
    pendingCount,
    sentCount,
    createReminder: createMutation.mutate,
    updateReminder: updateMutation.mutate,
    deleteReminder: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
