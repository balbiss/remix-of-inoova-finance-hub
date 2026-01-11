import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect } from 'react';

type Transaction = Tables<'transactions'>;

export function useTransactions(month?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', user?.id, month],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (month) {
        const startOfMonth = `${month}-01`;
        const endOfMonth = `${month}-31`;
        query = query.gte('date', startOfMonth).lte('date', endOfMonth);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const createMutation = useMutation({
    mutationFn: async (transaction: Omit<TablesInsert<'transactions'>, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'transactions'> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // Calculate balances
  const transactions = query.data || [];
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = income - expenses;

  return {
    transactions,
    income,
    expenses,
    balance,
    isLoading: query.isLoading,
    error: query.error,
    createTransaction: createMutation.mutate,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook to get balance history for charts
export function useBalanceHistory(period: '7D' | '30D' | '90D' | 'CUSTOM' = '30D', customStart?: Date | null, customEnd?: Date | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['balance-history', user?.id, period, customStart?.toISOString?.(), customEnd?.toISOString?.()],
    queryFn: async () => {
      if (!user) return [];

      let startDate: Date;
      let endDate: Date = new Date();
      if (period === 'CUSTOM' && customStart && customEnd) {
        startDate = customStart;
        endDate = customEnd;
      } else {
        const days = period === '7D' ? 7 : period === '30D' ? 30 : 90;
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days + 1);
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type, date')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      // Group by date and calculate running balance
      const dailyTotals: Record<string, number> = {};
      let runningBalance = 0;

      (data || []).forEach((t) => {
        const date = t.date || '';
        const amount = t.type === 'income' ? Number(t.amount) : -Number(t.amount);
        if (!dailyTotals[date]) {
          dailyTotals[date] = 0;
        }
        dailyTotals[date] += amount;
      });

      // Create array for selected days
      const history = [];
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        runningBalance += dailyTotals[dateStr] || 0;
        history.push({
          date: dateStr,
          balance: runningBalance,
        });
      }

      return history;
    },
    enabled: Boolean(user) && (period !== 'CUSTOM' || (!!customStart && !!customEnd)),
  });
}
