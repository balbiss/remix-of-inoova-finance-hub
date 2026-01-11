import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useGoals } from '@/hooks/useGoals';
import { useIsPro } from '@/hooks/useIsPro';
import { UpgradeDialog } from '@/components/UpgradeDialog';
import { formatCurrency } from '@/lib/utils-format';
import { cn } from '@/lib/utils';
import { Plus, Lock, TrendingUp, Calendar, Trophy, Target, Loader2, Sparkles, Pencil, Trash2, PiggyBank } from 'lucide-react';
import { AnnualProjectionChart } from '@/components/dashboard/AnnualProjectionChart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import type { Tables } from '@/integrations/supabase/types';

type Goal = Tables<'goals'>;

function CircularProgress({ percentage, color }: { percentage: number; color: string }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
        <motion.circle cx="50" cy="50" r="40" fill="none" stroke={`hsl(var(--${color}))`} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center"><span className={cn('text-sm font-bold financial-number', `text-${color}`)}>{percentage}%</span></div>
    </div>
  );
}

export default function Goals() {
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [addAmount, setAddAmount] = useState('');

  const { isPro, checkoutUrl } = useIsPro();
  const { goals, isLoading, createGoal, updateGoal, deleteGoal, isCreating, isUpdating, isDeleting } = useGoals();

  const goalColors = ['primary', 'ai', 'income'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) { toast.error('Preencha todos os campos obrigatórios'); return; }
    createGoal({ title, target_amount: parseFloat(targetAmount), deadline: deadline || null }, {
      onSuccess: () => { toast.success('Meta criada!'); setShowNewGoal(false); setTitle(''); setTargetAmount(''); setDeadline(''); },
      onError: (error) => toast.error('Erro ao criar: ' + error.message),
    });
  };

  const handleOpenEdit = () => {
    if (!selectedGoal) return;
    setEditTitle(selectedGoal.title);
    setEditTargetAmount(selectedGoal.target_amount.toString());
    setEditDeadline(selectedGoal.deadline || '');
    setShowEdit(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editTargetAmount) { toast.error('Preencha os campos'); return; }
    if (!selectedGoal || !selectedGoal.id) { toast.error('Meta inválida!'); return; }
    let deadlineISO: string | null = null;
    if (editDeadline) {
      // Se já estiver em formato ISO, mantém. Se não, monta manualmente yyyy-mm-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(editDeadline)) {
        deadlineISO = editDeadline;
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(editDeadline)) {
        const [dia, mes, ano] = editDeadline.split('/');
        deadlineISO = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      }
      // Não validar com Date.parse para evitar bug de fuso horário
    }
    console.log('Enviando deadline:', deadlineISO);
    updateGoal({ id: selectedGoal.id, title: editTitle.trim(), target_amount: parseFloat(editTargetAmount), deadline: deadlineISO || null }, {
      onSuccess: () => { toast.success('Meta atualizada!'); setShowEdit(false); setSelectedGoal(null); },
      onError: (err) => { toast.error('Erro ao atualizar'); console.error('Erro ao atualizar meta:', err); },
    });
  };

  const handleOpenAddSavings = () => { setAddAmount(''); setSelectedGoal(selectedGoal); setShowAddSavings(true); };

  const handleAddSavings = () => {
    if (!selectedGoal || !addAmount) { toast.error('Informe o valor'); return; }
    const newSaved = (selectedGoal.saved_amount || 0) + parseFloat(addAmount);
    updateGoal({ id: selectedGoal.id, saved_amount: newSaved }, {
      onSuccess: () => { toast.success('Valor adicionado!'); setShowAddSavings(false); setSelectedGoal(null); },
      onError: () => toast.error('Erro ao adicionar'),
    });
  };

  const handleDelete = () => {
    if (!selectedGoal) return;
    deleteGoal(selectedGoal.id, {
      onSuccess: () => { toast.success('Meta excluída!'); setShowDeleteDialog(false); setSelectedGoal(null); },
      onError: () => toast.error('Erro ao excluir'),
    });
  };

  const handleNewClick = () => { if (!isPro) { setShowUpgrade(true); return; } setShowNewGoal(true); };
  const handleEditClick = () => { if (!isPro) { setShowUpgrade(true); return; } handleOpenEdit(); };
  const handleDeleteClick = () => { if (!isPro) { setShowUpgrade(true); return; } setShowDeleteDialog(true); };
  const handleAddSavingsClick = () => { if (!isPro) { setShowUpgrade(true); return; } handleOpenAddSavings(); };

  if (isLoading) {
    return (<MainLayout><div className="px-4 lg:px-6 py-4 space-y-4"><Skeleton className="h-8 w-48" /><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div><Skeleton className="h-48 rounded-xl" /></div></MainLayout>);
  }

  return (
    <MainLayout>
      <div className="px-4 lg:px-10 py-6 lg:py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl lg:text-4xl font-black text-foreground tracking-tighter uppercase italic">
                Seus <span className="text-ai">Sonhos</span> Estão Aqui
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground mt-1">Planeje, poupe e conquiste com inteligência financeira dedicada.</p>
            </div>
            <Button size="lg" onClick={handleNewClick} className="gap-2 h-12 text-sm gradient-primary border-0 font-bold rounded-full px-8 shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" /> Nova Meta
            </Button>
          </div>
        </motion.div>

        {goals.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 mb-6"><Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhuma meta criada</p></motion.div>}

        {goals.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {goals.map((goal, index) => {
              const savedAmount = Number(goal.saved_amount) || 0;
              const targetAmountNum = Number(goal.target_amount);
              const percentage = Math.min(Math.round((savedAmount / targetAmountNum) * 100), 100);
              const color = goalColors[index % goalColors.length];
              const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
              const daysLeft = deadlineDate ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
              return (
                <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }} whileHover={{ scale: 1.02 }} onClick={() => setSelectedGoal(goal)} className="bg-card border border-border rounded-xl p-4 hover-lift cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('p-2 rounded-lg', color === 'primary' && 'bg-primary/10', color === 'ai' && 'bg-ai/10', color === 'income' && 'bg-income/10')}>
                      <Target className={cn('w-4 h-4', color === 'primary' && 'text-primary', color === 'ai' && 'text-ai', color === 'income' && 'text-income')} />
                    </div>
                    {deadlineDate ? (
                      <Badge variant="outline" className="bg-secondary/50 border-border text-[10px] gap-1 px-2 py-0.5 font-bold">
                        <Calendar className="w-3 h-3 text-primary" />
                        {daysLeft !== null && daysLeft > 0 ? `${daysLeft} dias restantes` : (daysLeft === 0 ? 'Expira hoje!' : 'Vencido')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-secondary/30 border-dashed text-[10px] px-2 py-0.5 text-muted-foreground uppercase font-bold tracking-tighter">Sem Prazo</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight italic">{goal.title}</h3>
                    {percentage >= 80 && percentage < 100 && (
                      <Badge className="bg-income text-white text-[9px] font-black h-4 px-1.5 animate-pulse">QUASE LÁ!</Badge>
                    )}
                    {percentage === 100 && (
                      <Badge className="bg-yellow-500 text-black text-[9px] font-black h-4 px-1.5">CONCLUÍDO! 🏆</Badge>
                    )}
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <div><p className={cn('text-lg font-bold financial-number', color === 'primary' && 'text-primary', color === 'ai' && 'text-ai', color === 'income' && 'text-income')}>{formatCurrency(savedAmount)}</p><p className="text-xs text-muted-foreground">de {formatCurrency(targetAmountNum)}</p></div>
                    <CircularProgress percentage={percentage} color={color} />
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }} className={cn('h-full rounded-full', color === 'primary' && 'bg-primary', color === 'ai' && 'bg-ai', color === 'income' && 'bg-income')} /></div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative">
          <div className={cn(!isPro && 'locked-blur')}>
            <AnnualProjectionChart />
          </div>
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
              <div className="text-center p-4"><div className="w-12 h-12 mx-auto mb-3 rounded-full bg-ai/10 flex items-center justify-center"><Lock className="w-6 h-6 text-ai" /></div><h3 className="text-base font-bold text-foreground mb-1">Recurso PRO</h3><p className="text-xs text-muted-foreground mb-3 max-w-xs">Desbloqueie análises avançadas, projeções com IA e muito mais.</p><a href={checkoutUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" className="gradient-ai text-white border-0 h-9 px-6 text-xs"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Seja PRO por R$ 19,90/mês</Button></a></div>
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={showNewGoal} onOpenChange={setShowNewGoal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="text-base">Criar Nova Meta</DialogTitle><DialogDescription className="text-xs">Defina um objetivo financeiro para acompanhar.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-3">
            <div className="space-y-1.5"><Label className="text-xs">Nome da Meta</Label><Input placeholder="Ex: Viagem para Europa" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-secondary border-none h-9 text-sm" disabled={isCreating} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Valor Alvo</Label><Input type="number" placeholder="10000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="bg-secondary border-none h-9 text-sm" disabled={isCreating} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Prazo (opcional)</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="bg-secondary border-none h-9 text-sm" disabled={isCreating} /></div>
            <Button type="submit" className="w-full h-9 text-sm" disabled={isCreating}>{isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trophy className="w-3.5 h-3.5 mr-1.5" />Criar Meta</>}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
        <SheetContent className="w-full sm:max-w-sm bg-card border-border">
          <SheetHeader><SheetTitle>Detalhes da Meta</SheetTitle></SheetHeader>
          {selectedGoal && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-center"><CircularProgress percentage={Math.min(Math.round(((selectedGoal.saved_amount || 0) / selectedGoal.target_amount) * 100), 100)} color="primary" /></div>
              <div><p className="text-sm text-muted-foreground">Título</p><p className="font-medium">{selectedGoal.title}</p></div>
              <div><p className="text-sm text-muted-foreground">Progresso</p><p className="font-medium">{formatCurrency(selectedGoal.saved_amount || 0)} de {formatCurrency(selectedGoal.target_amount)}</p></div>
              {selectedGoal.deadline && <div><p className="text-sm text-muted-foreground">Prazo</p><p className="font-medium">{(() => {
                // deadline vem como yyyy-mm-dd
                const [ano, mes, dia] = selectedGoal.deadline.split('-');
                return `${dia}/${mes}/${ano}`;
              })()}</p></div>}
              <div className="space-y-2 pt-4">
                <Button className="w-full gap-2" onClick={handleAddSavingsClick}><PiggyBank className="w-4 h-4" />{isPro ? 'Adicionar Valor' : 'Adicionar (PRO)'}</Button>
                <Button variant="outline" className="w-full gap-2" onClick={handleEditClick}><Pencil className="w-4 h-4" />{isPro ? 'Editar' : 'Editar (PRO)'}</Button>
                <Button variant="destructive" className="w-full gap-2" onClick={handleDeleteClick}><Trash2 className="w-4 h-4" />{isPro ? 'Excluir' : 'Excluir (PRO)'}</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showAddSavings} onOpenChange={setShowAddSavings}>
        <DialogContent className="bg-card border-border max-w-sm"><DialogHeader><DialogTitle>Adicionar ao Guardado</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-3"><div className="space-y-1.5"><Label className="text-xs">Valor</Label><Input type="number" placeholder="500" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="bg-secondary border-none h-9 text-sm" /></div><Button onClick={handleAddSavings} className="w-full h-9 text-sm" disabled={isUpdating}>{isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="bg-card border-border max-w-sm"><DialogHeader><DialogTitle>Editar Meta</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-3">
            <div className="space-y-1.5"><Label className="text-xs">Nome</Label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-secondary border-none h-9 text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Valor Alvo</Label><Input type="number" value={editTargetAmount} onChange={(e) => setEditTargetAmount(e.target.value)} className="bg-secondary border-none h-9 text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Prazo</Label><Input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="bg-secondary border-none h-9 text-sm" /></div>
            <Button onClick={handleSaveEdit} className="w-full h-9 text-sm" disabled={isUpdating}>{isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}><AlertDialogContent className="bg-card border-border"><AlertDialogHeader><AlertDialogTitle>Excluir meta?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>{isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} feature="gerenciar metas" />
    </MainLayout>
  );
}
