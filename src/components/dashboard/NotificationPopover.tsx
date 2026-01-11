import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Sparkles, X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useReminders } from '@/hooks/useReminders';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/utils-format';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function NotificationPopover() {
    const { reminders, pendingCount } = useReminders('pending');
    const { expenses, income } = useTransactions();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    // Simple logic for AI alerts to show in notifications
    const alerts = [];
    if (expenses > income && income > 0) {
        alerts.push({
            id: 'alert-budget',
            title: 'Alerta de Gastos',
            message: 'Suas despesas superaram sua renda este mês.',
            type: 'warning',
            icon: AlertTriangle,
        });
    }

    const allNotifications = [
        ...reminders.slice(0, 3).map(r => ({
            id: r.id,
            title: r.title,
            message: `Vencimento em ${new Date(r.remind_at).toLocaleDateString('pt-BR')}`,
            type: 'reminder',
            icon: Clock,
            path: '/reminders'
        })),
        ...alerts.map(a => ({
            ...a,
            path: '/transactions'
        }))
    ];

    const hasNotifications = allNotifications.length > 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground h-8 w-8">
                    <Bell className="w-4 h-4" />
                    {hasNotifications && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-expense rounded-full" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-card border-border shadow-2xl rounded-2xl overflow-hidden" align="end" sideOffset={8}>
                <div className="p-4 border-b border-border bg-card/50">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" /> Notificações
                        </h3>
                        {hasNotifications && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                {allNotifications.length} NOVAS
                            </span>
                        )}
                    </div>
                </div>

                <div className="max-h-[350px] overflow-y-auto p-2">
                    {!hasNotifications ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Bell className="w-6 h-6 text-muted-foreground opacity-20" />
                            </div>
                            <p className="text-xs font-medium text-foreground">Tudo limpo por aqui!</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Nenhuma notificação nova no momento.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {allNotifications.map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => {
                                        navigate(notif.path);
                                        setOpen(false);
                                    }}
                                    className="w-full text-left p-3 rounded-xl hover:bg-secondary/50 transition-all group flex gap-3 items-start"
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg shrink-0",
                                        notif.type === 'warning' ? "bg-expense/10 text-expense" : "bg-primary/10 text-primary"
                                    )}>
                                        <notif.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-foreground line-clamp-1">{notif.title}</p>
                                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {hasNotifications && (
                    <div className="p-2 border-t border-border bg-card/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-[10px] font-bold text-primary hover:text-primary hover:bg-primary/5 uppercase tracking-wider"
                            onClick={() => {
                                navigate('/reminders');
                                setOpen(false);
                            }}
                        >
                            Ver Tudo no Assistente IA
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
