import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingDown, Target, Award, X, ChevronRight, Share2, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VenuxWrappedProps {
    open: boolean;
    onClose: () => void;
}

export function VenuxWrapped({ open, onClose }: VenuxWrappedProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(0);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['wrapped_stats'],
        queryFn: async () => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .gte('date', startOfMonth);

            if (error) throw error;

            const expenses = transactions.filter(t => t.type === 'expense');
            const incomes = transactions.filter(t => t.type === 'income');

            const totalSpent = expenses.reduce((acc, t) => acc + Number(t.amount), 0);
            const totalEarned = incomes.reduce((acc, t) => acc + Number(t.amount), 0);

            const categoryMap: Record<string, number> = {};
            expenses.forEach(t => {
                categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
            });

            const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
            const largestExpense = expenses.sort((a, b) => Number(b.amount) - Number(a.amount))[0];

            return {
                totalSpent,
                totalEarned,
                topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
                largestExpense,
                transactionCount: transactions.length
            };
        },
        enabled: open && !!user
    });

    useEffect(() => {
        if (!open) setStep(0);
    }, [open]);

    const steps = [
        {
            title: "Seu Mês em Resumo",
            content: (
                <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">O Venux analisou <br /> seu <span className="text-primary">sucesso</span></h2>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Você Investiu</p>
                            <p className="text-lg font-black text-income mt-1">R$ {stats?.totalSpent.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Movimentações</p>
                            <p className="text-lg font-black text-primary mt-1">{stats?.transactionCount} registros</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Sua Categoria Dominante",
            content: (
                <div className="space-y-8 text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto transform rotate-12">
                        <PieChart className="w-12 h-12 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Seu maior foco foi...</h2>
                        <div className="inline-block px-6 py-2 rounded-full bg-primary text-white font-black text-xl uppercase italic shadow-lg shadow-primary/30">
                            {stats?.topCategory?.name || 'Variação'}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium px-8">
                        Você destinou <span className="text-foreground font-bold">R$ {stats?.topCategory?.amount.toLocaleString('pt-BR')}</span> para essa categoria este mês.
                    </p>
                </div>
            )
        },
        {
            title: "Status Financeiro",
            content: (
                <div className="space-y-8 text-center">
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto border-4 border-primary">
                        <Award className="w-12 h-12 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Parabéns pelo <span className="text-primary text-4xl">Foco</span></h2>
                        <p className="text-muted-foreground mt-4 font-medium">Sua organização financeira está acima da média. Continue usando o IA Assessor para otimizar seus lucros.</p>
                    </div>
                    <div className="pt-6">
                        <Button onClick={onClose} className="w-full h-14 rounded-2xl gradient-primary text-white font-black uppercase italic shadow-xl">
                            Finalizar Retrospectiva
                        </Button>
                    </div>
                </div>
            )
        }
    ];

    if (!open) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-secondary flex">
                        {steps.map((_, i) => (
                            <div key={i} className={cn(
                                "h-full flex-1 transition-all duration-500",
                                i <= step ? "bg-primary" : "bg-transparent"
                            )} />
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-3 sm:p-2 rounded-full bg-secondary/80 text-foreground hover:bg-secondary transition-all z-20 shadow-lg"
                    >
                        <X className="w-5 h-5 sm:w-4 h-4" />
                    </button>

                    <div className="p-8 pt-12 min-h-[480px] flex flex-col justify-center">
                        {stats ? (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1"
                            >
                                {steps[step].content}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                <p className="font-bold uppercase italic text-[10px] tracking-widest text-muted-foreground">Analisando seus dados...</p>
                            </div>
                        )}

                        {step < steps.length - 1 && stats && (
                            <div className="mt-8 flex justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setStep(step + 1)}
                                    className="flex items-center gap-2 text-primary font-black uppercase italic tracking-tighter"
                                >
                                    Ver mais <ChevronRight className="w-5 h-5" />
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {/* Signature */}
                    <div className="bg-primary/5 py-4 text-center border-t border-primary/10">
                        <span className="text-[10px] font-black uppercase italic tracking-widest text-primary/60">VENUX WRAPPED • {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
