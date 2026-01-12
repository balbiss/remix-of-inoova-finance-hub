import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, Calendar, Trash2, Edit2, AlertCircle, ShoppingBag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AddSubscriptionSheet } from '@/components/sheets/AddSubscriptionSheet';

export default function MySubscriptions() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);

    const { data: subscriptions, isLoading } = useQuery({
        queryKey: ['recurring_subscriptions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('recurring_subscriptions')
                .select('*')
                .order('next_billing_date', { ascending: true });
            if (error) throw error;
            return data;
        },
        enabled: !!user
    });

    const totalMonthly = subscriptions?.reduce((acc, sub) => {
        if (sub.billing_cycle === 'monthly') return acc + Number(sub.amount);
        if (sub.billing_cycle === 'yearly') return acc + (Number(sub.amount) / 12);
        return acc;
    }, 0) || 0;

    if (isLoading) {
        return (
            <MainLayout>
                <div className="p-8 space-y-6 max-w-6xl mx-auto">
                    <Skeleton className="h-12 w-64 rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-32 rounded-3xl" />
                        <Skeleton className="h-32 rounded-3xl" />
                        <Skeleton className="h-32 rounded-3xl" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="px-4 lg:px-10 py-8 lg:py-12 max-w-[1400px] space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl lg:text-5xl font-black text-foreground tracking-tighter uppercase italic">
                            Minhas <span className="text-primary">Assinaturas</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium">Controle seus gastos fixos e evite surpresas na fatura.</p>
                    </motion.div>

                    <Button
                        onClick={() => setIsAdding(true)}
                        className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-wider transition-all shadow-xl shadow-primary/20 gap-3"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Assinatura
                    </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Stats Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 p-8 rounded-[40px] bg-card border border-border shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-colors" />
                        <div className="relative space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Investimento Mensal</p>
                                <p className="text-3xl font-black text-foreground tracking-tight">
                                    {totalMonthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-border/50">
                                <p className="text-[10px] font-bold text-muted-foreground/60">{subscriptions?.length || 0} serviços ativos</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Subscription List */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subscriptions && subscriptions.length > 0 ? (
                            subscriptions.map((sub, idx) => (
                                <motion.div
                                    key={sub.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-6 rounded-[32px] bg-card/40 border border-border hover:border-primary/50 transition-all group relative"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shadow-inner">
                                                <ShoppingBag className="w-7 h-7 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-foreground uppercase tracking-tight italic">{sub.name}</h3>
                                                <Badge variant="outline" className="text-[8px] uppercase tracking-widest mt-1 opacity-60">
                                                    {sub.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-foreground tracking-tighter">
                                                {Number(sub.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                                Vence em {format(new Date(sub.next_billing_date), 'dd/MM', { locale: ptBR })}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-6 rounded-[40px] border-2 border-dashed border-border opacity-50">
                                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                                    <AlertCircle className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic">Nenhuma assinatura ativa</h3>
                                    <p className="text-sm">Comece adicionando seus serviços recorrentes para ter controle total.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <AddSubscriptionSheet open={isAdding} onOpenChange={setIsAdding} />
        </MainLayout>
    );
}
