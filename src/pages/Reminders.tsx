import { fromUtcToBrazil } from '@/lib/from-utc-to-brazil';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
// Filtros de período
const periodOptions = [
  { label: 'Hoje', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mês', value: 'month' },
  { label: 'Ano', value: 'year' },
  { label: 'Todos', value: 'all' },
];
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils-format';
import { MainLayout } from '@/components/layout/MainLayout';
import { useReminders } from '@/hooks/useReminders';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useIsPro } from '@/hooks/useIsPro';
import { UpgradeDialog } from '@/components/UpgradeDialog';
import { cn } from '@/lib/utils';
import {
  Bell, Plus, Clock, CheckCircle2, AlertCircle, Calendar,
  MessageCircle, Send, Loader2, Pencil, Trash2, ArrowRight, BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AddReminderSheet } from '@/components/sheets/AddReminderSheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Reminder = Tables<'reminders'>;

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, className: 'bg-ai/10 text-ai border-ai/20' },
  sent: { label: 'Enviado', icon: CheckCircle2, className: 'bg-income/10 text-income border-income/20' },
  failed: { label: 'Falhou', icon: AlertCircle, className: 'bg-expense/10 text-expense border-expense/20' },
  completed: { label: 'Concluído', icon: CheckCircle2, className: 'bg-green-900/10 text-green-400 border-green-900/20' },
};

export default function Reminders() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');
  const [showNewReminder, setShowNewReminder] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all');
  // Removido: estados locais de novo lembrete, pois AddReminderSheet já gerencia isso

  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editValor, setEditValor] = useState('');

  const { isPro } = useIsPro();
  const { reminders, isLoading, pendingCount, sentCount, createReminder, updateReminder, deleteReminder, isCreating, isUpdating, isDeleting } = useReminders(filter === 'all' ? undefined : filter);
  const { subscribeToPush, unsubscribeFromPush, subscription } = usePushNotifications();

  // Removido: handleSubmit duplicado, AddReminderSheet já faz isso

  useEffect(() => {
    if (showEdit && selectedReminder) {
      // Extrai data e hora diretamente da string do banco, sem conversão de fuso
      // Exemplo: '2026-01-10 02:05:00+00'
      const raw = selectedReminder.remind_at;
      const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
      let dateStr = '';
      let timeStr = '';
      if (match) {
        dateStr = `${match[1]}-${match[2]}-${match[3]}`;
        timeStr = `${match[4]}:${match[5]}`;
      }
      setEditTitle(selectedReminder.title);
      setEditDate(dateStr);
      setEditTime(timeStr);
      setEditValor(selectedReminder.valor != null ? String(selectedReminder.valor) : '');
    }
  }, [showEdit, selectedReminder]);

  const handleOpenEdit = () => {
    if (!selectedReminder) return;
    // Extrai data e hora diretamente da string do banco, sem conversão de fuso
    const raw = selectedReminder.remind_at;
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    let dateStr = '';
    let timeStr = '';
    if (match) {
      dateStr = `${match[1]}-${match[2]}-${match[3]}`;
      timeStr = `${match[4]}:${match[5]}`;
    }
    setEditTitle(selectedReminder.title);
    setEditDate(dateStr);
    setEditTime(timeStr);
    setShowEdit(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editDate) { toast.error('Preencha todos os campos'); return; }
    const id = selectedReminder?.id;
    if (!id) return;
    const remindAt = new Date(`${editDate}T${editTime}`).toISOString();
    updateReminder({ id, title: editTitle.trim(), remind_at: remindAt }, {
      onSuccess: () => { toast.success('Lembrete atualizado!'); setShowEdit(false); },
      onError: () => toast.error('Erro ao atualizar'),
    });
  };

  const handleDelete = () => {
    if (!selectedReminder) return;
    deleteReminder(selectedReminder.id, {
      onSuccess: () => { toast.success('Lembrete excluído!'); setShowDeleteDialog(false); setSelectedReminder(null); },
      onError: () => toast.error('Erro ao excluir'),
    });
  };

  const handleNewClick = () => { if (!isPro) { setShowUpgrade(true); return; } setShowNewReminder(true); };
  const handleEditClick = () => { if (!isPro) { setShowUpgrade(true); return; } handleOpenEdit(); };
  const handleDeleteClick = () => { if (!isPro) { setShowUpgrade(true); return; } setShowDeleteDialog(true); };

  if (isLoading) {
    return (<MainLayout><div className="px-4 lg:px-6 py-4 space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 gap-3"><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /></div><div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div></div></MainLayout>);
  }

  // Filtragem por período
  const filteredReminders = reminders.filter(reminder => {
    if (period === 'all') return true;
    // Extrai ano, mês, dia do campo remind_at
    // Exemplo: '2026-01-10 02:05:00+00'
    const match = reminder.remind_at.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return false;
    const [_, year, month, day] = match;
    const reminderDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    const now = new Date();
    if (period === 'today') {
      return reminderDate.getUTCFullYear() === now.getUTCFullYear() &&
        reminderDate.getUTCMonth() === now.getUTCMonth() &&
        reminderDate.getUTCDate() === now.getUTCDate();
    }
    if (period === 'week') {
      // Semana ISO: segunda a domingo
      const getWeek = (d: Date) => {
        const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      };
      return reminderDate.getUTCFullYear() === now.getUTCFullYear() && getWeek(reminderDate) === getWeek(now);
    }
    if (period === 'month') {
      return reminderDate.getUTCFullYear() === now.getUTCFullYear() && reminderDate.getUTCMonth() === now.getUTCMonth();
    }
    if (period === 'year') {
      return reminderDate.getUTCFullYear() === now.getUTCFullYear();
    }
    return true;
  });

  return (
    <MainLayout>
      <div className="w-full px-0 sm:px-4 lg:px-6 py-2 sm:py-4 relative z-0 overflow-visible">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 w-full flex flex-col items-center">
          <div className="flex flex-col items-center w-full mb-1">
            <h1 className="text-2xl lg:text-3xl font-black text-foreground text-center w-full tracking-tighter uppercase italic">
              Seu <span className="text-ai">Assistente Pessoal</span>
            </h1>
            <p className="text-sm text-muted-foreground text-center w-full mt-1 max-w-md">
              Deixe a nossa IA lembrar você de pagar as contas. Avisos inteligentes diretamente no seu WhatsApp.
            </p>

            {/* Steps Visual - New Section */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-6 mb-2 py-4 px-6 rounded-3xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">1</div>
                <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">Agende</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-ai/20 flex items-center justify-center text-[10px] font-bold text-ai">2</div>
                <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">IA Analisa</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-income/20 flex items-center justify-center text-[10px] font-bold text-income">3</div>
                <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">Receba</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 w-full">
              {periodOptions.map(opt => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={period === opt.value ? 'default' : 'outline'}
                  onClick={() => setPeriod(opt.value as any)}
                  className="rounded-full h-8 px-4 text-[11px] font-bold"
                >
                  {opt.label}
                </Button>
              ))}
              <Button size="sm" onClick={handleNewClick} className="gap-1.5 gradient-ai text-white border-0 h-9 px-4 text-xs rounded-full font-bold shadow-lg shadow-ai/20 ml-2">
                <Plus className="w-4 h-4" /> Novo Lembrete
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-center">
              {subscription ? (
                <Button variant="ghost" size="sm" onClick={unsubscribeFromPush} className="text-[10px] text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-full gap-1.5 h-7 px-3 border border-border/40">
                  <BellOff className="w-3 h-3" /> <span className="opacity-70">Silenciar</span>
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={subscribeToPush} className="text-[10px] bg-secondary/20 hover:bg-secondary/40 text-secondary-foreground border-secondary/20 rounded-full gap-1.5 h-7 px-3">
                  <Bell className="w-3 h-3" /> Receber Alertas
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3 mb-4 w-full">
          <div className="bg-ai/10 border border-ai/20 rounded-xl p-3"><div className="flex items-center gap-2"><div className="p-1.5 bg-ai/20 rounded-lg"><Clock className="w-4 h-4 text-ai" /></div><div><p className="text-lg font-bold text-ai financial-number">{pendingCount}</p><p className="text-xs text-muted-foreground">Pendentes</p></div></div></div>
          <div className="bg-income/10 border border-income/20 rounded-xl p-3"><div className="flex items-center gap-2"><div className="p-1.5 bg-income/20 rounded-lg"><CheckCircle2 className="w-4 h-4 text-income" /></div><div><p className="text-lg font-bold text-income financial-number">{sentCount}</p><p className="text-xs text-muted-foreground">Enviados</p></div></div></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-1.5 mb-4">
          {/* Filtros podem ser expandidos futuramente */}
        </motion.div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
          {filteredReminders.map((reminder, index) => {
            const status = statusConfig[reminder.status as keyof typeof statusConfig] || statusConfig.pending;
            // Ícone especial para completed
            let StatusIcon = status.icon;
            let iconColor = '';
            if (reminder.status === 'completed') {
              StatusIcon = CheckCircle2;
              iconColor = 'text-green-400';
            } else if (reminder.status === 'pending') {
              iconColor = 'text-ai';
            } else if (reminder.status === 'sent') {
              iconColor = 'text-income';
            } else if (reminder.status === 'failed') {
              iconColor = 'text-expense';
            }
            const brDateStr = fromUtcToBrazil(reminder.remind_at);
            const [brDate, brTime] = brDateStr.split(' ');
            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-card border border-border rounded-xl p-3 sm:p-4 lg:p-5 cursor-pointer w-full mx-0 flex flex-col items-start text-left shadow-sm hover:shadow-md transition-all relative h-full min-h-[120px]"
                style={{ minWidth: 0 }}
                onClick={() => setSelectedReminder(reminder)}
              >
                <div className="flex flex-col items-start gap-1 sm:gap-2 w-full">
                  <div className={cn('p-2 rounded-lg shrink-0',
                    reminder.status === 'pending' ? 'bg-ai/10' :
                      reminder.status === 'sent' ? 'bg-income/10' :
                        reminder.status === 'failed' ? 'bg-expense/10' :
                          reminder.status === 'completed' ? 'bg-green-900/10' :
                            '')}>
                    <StatusIcon className={cn('w-4 h-4', iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center w-full mb-0.5 min-h-[28px]">
                      <div className="flex-1 min-w-0 flex flex-col">
                        <h3 className="text-base lg:text-lg font-bold text-foreground break-words mr-2 leading-tight">{reminder.title}</h3>
                        {reminder.valor != null && (
                          <span className="text-sm lg:text-base text-muted-foreground mr-2 font-medium">{formatCurrency(reminder.valor)}</span>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 lg:top-4 lg:right-4">
                      <Badge variant="outline" className={cn('shrink-0 text-[10px] lg:text-xs px-2 py-0.5', status.className)}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center text-[13px] sm:text-[13px] text-muted-foreground w-full gap-2 mt-2">
                      <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{brDate}</div>
                      <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{brTime}</div>
                    </div>
                    <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 flex items-center gap-1.5 text-income text-[11px] lg:text-xs font-black bg-income/10 px-2 py-1 rounded-full border border-income/20 hover:bg-income/20 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />WHATSAPP
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {selectedReminder && (
          <AlertDialog open={!!selectedReminder} onOpenChange={open => { if (!open) setSelectedReminder(null); }}>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>O que deseja fazer?</AlertDialogTitle>
                <AlertDialogDescription>Escolha uma ação para o lembrete <b>{selectedReminder.title}</b>.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowEdit(true);
                  // NÃO limpar selectedReminder aqui!
                }}>Editar</Button>
                <Button variant="destructive" onClick={() => {
                  setShowDeleteDialog(true);
                  // NÃO limpar selectedReminder aqui!
                }}>Excluir</Button>
                <AlertDialogCancel onClick={() => setSelectedReminder(null)}>Fechar</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {showEdit && (
          <AlertDialog open={showEdit} onOpenChange={open => { if (!open) setShowEdit(false); }}>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Editar lembrete</AlertDialogTitle>
                <AlertDialogDescription>Altere os dados do lembrete e salve.</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input id="edit-title" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                <Label htmlFor="edit-valor">Valor</Label>
                <Input id="edit-valor" type="number" value={editValor} onChange={e => setEditValor(e.target.value)} min="0" step="0.01" />
                <Label htmlFor="edit-date">Data</Label>
                <Input id="edit-date" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                <Label htmlFor="edit-time">Hora</Label>
                <Input id="edit-time" type="time" value={editTime} onChange={e => setEditTime(e.target.value)} />
              </div>
              <AlertDialogFooter>
                <Button onClick={() => {
                  const id = selectedReminder?.id;
                  if (!id) return;
                  const remindAt = new Date(`${editDate}T${editTime}`).toISOString();
                  updateReminder({
                    id,
                    title: editTitle.trim(),
                    remind_at: remindAt,
                    valor: editValor ? parseFloat(editValor.replace(',', '.')) : null
                  }, {
                    onSuccess: () => { toast.success('Lembrete atualizado!'); setShowEdit(false); },
                    onError: () => toast.error('Erro ao atualizar'),
                  });
                }} disabled={isUpdating}>{isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}</Button>
                <AlertDialogCancel onClick={() => setShowEdit(false)}>Cancelar</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <AddReminderSheet open={showNewReminder} onOpenChange={setShowNewReminder} />

      {/* Edição de lembrete pode ser implementada usando AddReminderSheet futuramente */}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border"><AlertDialogHeader><AlertDialogTitle>Excluir lembrete?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>{isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} feature="gerenciar lembretes" />
    </MainLayout>
  );
}
