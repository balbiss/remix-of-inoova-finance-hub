import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProfile } from '@/hooks/useProfile';
import { useIsPro } from '@/hooks/useIsPro';
import { cn } from '@/lib/utils';
import {
    Crown,
    Calendar,
    CheckCircle2,
    CreditCard,
    ArrowRight,
    ShieldCheck,
    Zap,
    RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { syncSubscription, STRIPE_PLANS } from '@/lib/stripe';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useQueryClient } from '@tanstack/react-query';

export default function Subscription() {
    const { profile, isLoading } = useProfile();
    const { isPro, handleUpgrade, handleManageBilling } = useIsPro();
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = useQueryClient();

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await syncSubscription();
            toast.success('Dados sincronizados com o Stripe!');
            // Invalida a query do perfil para que o React Query busque os novos dados
            // sem precisar recarregar a página inteira.
            queryClient.invalidateQueries({ queryKey: ['profile', profile?.id] });
        } catch (error: any) {
            toast.error('Erro ao sincronizar: ' + error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    // REMOVI O useEffect QUE CAUSA O LOOP AUTOMÁTICO

    if (isLoading) {
        return (
            <MainLayout>
                <div className="px-4 lg:px-6 py-6 space-y-6 max-w-4xl mx-auto">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-64 w-full rounded-3xl" />
                </div>
            </MainLayout>
        );
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '---';
        try {
            return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        } catch (e) {
            return '---';
        }
    };

    return (
        <MainLayout>
            <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-[1400px] space-y-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl lg:text-4xl font-black text-foreground tracking-tighter uppercase italic">
                        Sua <span className="text-ai">Jornada PRO</span>
                    </h1>
                    <p className="text-sm lg:text-base text-muted-foreground mt-2">Gerencie sua assinatura e sinta o poder da gestão profissional.</p>
                </motion.div>

                {/* Dynamic Layout Container */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Main Status Column (2/3) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 relative overflow-hidden rounded-[40px] border border-border bg-card shadow-2xl"
                    >
                        {/* Ambient Background */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ai/5 rounded-full -ml-48 -mb-48 blur-[100px]" />

                        <div className="p-8 lg:p-12 relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-16 h-16 lg:w-20 lg:h-20 rounded-3xl flex items-center justify-center shadow-lg",
                                            isPro ? "bg-ai/20 text-ai shadow-ai/20" : "bg-muted text-muted-foreground"
                                        )}>
                                            {isPro ? <Crown className="w-8 h-8 lg:w-10 lg:h-10" /> : <Zap className="w-8 h-8 lg:w-10 lg:h-10" />}
                                        </div>
                                        <div>
                                            <Badge variant={isPro ? "default" : "secondary"} className={cn(
                                                "mb-2 px-3 py-1 uppercase font-black tracking-widest text-[9px]",
                                                isPro ? "bg-ai text-white" : ""
                                            )}>
                                                {isPro ? 'Membro Premium' : 'Conta Gratuita'}
                                            </Badge>
                                            <h2 className="text-2xl lg:text-4xl font-black text-foreground tracking-tighter uppercase">
                                                {profile?.plano_nome || (isPro ? 'Plano PRO' : 'Assinatura Free')}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                        <div className="flex items-center gap-4 p-5 rounded-[24px] bg-secondary/50 border border-border/50 transition-colors hover:bg-secondary/70">
                                            <Calendar className="w-6 h-6 text-primary shrink-0" />
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground/60">Data de Ativação</p>
                                                <p className="text-base font-bold text-foreground">{formatDate((profile as any)?.data_ativacao || profile?.created_at)}</p>
                                            </div>
                                        </div>
                                        {isPro && (
                                            <div className="flex items-center gap-4 p-5 rounded-[24px] bg-ai/5 border border-ai/20 transition-all hover:bg-ai/10">
                                                <ShieldCheck className="w-6 h-6 text-ai shrink-0" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] uppercase font-black tracking-[0.15em] text-ai/60">Próxima Renovação</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-ai hover:bg-ai/20 rounded-full"
                                                            onClick={handleSync}
                                                            disabled={isSyncing}
                                                        >
                                                            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm font-bold text-foreground">{formatDate(profile?.data_expiracao)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5 min-w-[280px]">
                                    <div className="p-6 rounded-[32px] bg-background/50 border border-border/60 backdrop-blur-xl shadow-inner">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-muted-foreground">Status do Sistema</span>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2.5 h-2.5 rounded-full", isPro ? "bg-income animate-pulse" : "bg-muted-foreground")} />
                                                <span className={cn("text-xs font-black uppercase tracking-wider", isPro ? "text-income" : "text-muted-foreground")}>
                                                    {isPro ? 'Ativo' : 'Básico'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: isPro ? "100%" : "35%" }}
                                                className={cn("h-full", isPro ? "bg-income shadow-[0_0_15px_rgba(var(--income-rgb),0.5)]" : "bg-muted-foreground")}
                                            />
                                        </div>
                                    </div>

                                    {!isPro ? (
                                        <Button
                                            onClick={() => handleUpgrade(STRIPE_PLANS.MENSAL.id)}
                                            className="w-full h-14 rounded-[24px] gradient-primary border-0 font-black text-base group shadow-xl shadow-primary/20"
                                        >
                                            Assinar Agora
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={handleManageBilling}
                                            className="w-full h-14 rounded-[24px] border-2 border-border font-black text-sm hover:bg-secondary hover:border-primary transition-all duration-300"
                                        >
                                            Gerenciar Pagamento
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Premium Benefits Grid (Visible when PRO) */}
                        {isPro && (
                            <div className="border-t border-border p-8 lg:p-12 bg-muted/20">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-8 text-center opacity-60">Seus Benefícios Premium Ativados</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        "Análise IA de Gastos",
                                        "Relatórios em PDF/Excel",
                                        "Suporte VIP 24/7",
                                        "Gestão de Metas Ilimitadas",
                                        "Alertas Automáticos WhatsApp",
                                        "Segurança Bancária SaaS"
                                    ].map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-4 group">
                                            <div className="w-8 h-8 rounded-xl bg-income/10 text-income flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold text-foreground opacity-80">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Side Info Column (1/3) */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-[40px] border border-border bg-card/40 backdrop-blur-sm shadow-sm space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <CreditCard className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-foreground tracking-tight uppercase italic">Faturamento Centralizado</h3>
                                <p className="text-xs text-muted-foreground font-medium mt-2 leading-relaxed">
                                    Nossa plataforma utiliza o Stripe para garantir que todos os seus dados de pagamento estejam cifrados e seguros.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-2xl font-bold border-muted-foreground/20 hover:bg-secondary"
                                onClick={handleManageBilling}
                            >
                                Central de Faturamento
                            </Button>
                        </div>

                        <a
                            href="https://wa.me/5511999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-8 rounded-[40px] border-2 border-dashed border-border/80 bg-transparent flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center italic font-black text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">?</div>
                            <div>
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">Dúvida sobre o plano?</p>
                                <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">Nosso time responde em menos de 1 hora.</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
