import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTransactions } from '@/hooks/useTransactions';
import { useIsPro } from '@/hooks/useIsPro';
import { UpgradeDialog } from '@/components/UpgradeDialog';
import { formatCurrency } from '@/lib/utils-format';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { Search, Filter, Loader2, Trash2, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Download, ChevronRight, FileDown } from 'lucide-react';
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateTransactionsPDF } from '@/lib/pdf-generator';
import { useProfile } from '@/hooks/useProfile';

type Transaction = Tables<'transactions'>;

const categoryIcons: Record<string, string> = { 'Alimentação': 'UtensilsCrossed', 'Transporte': 'Car', 'Mercado': 'ShoppingCart', 'Contas': 'Zap', 'Streaming': 'Tv', 'Trabalho': 'Briefcase', 'Salário': 'Briefcase', 'Freelance': 'Palette', 'Saúde': 'Heart', 'Compras': 'Package', 'Outros': 'Circle' };

export default function Transactions() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState('income');
  const [editDescription, setEditDescription] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const { isPro } = useIsPro();
  const { profile } = useProfile();
  const { transactions, isLoading, deleteTransaction, isDeleting, updateTransaction, isUpdating } = useTransactions();

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());

    // Filtro de Data
    let matchesDate = true;
    if (dateRange?.from && dateRange?.to) {
      const transDate = new Date(t.date);
      matchesDate = isWithinInterval(transDate, { start: dateRange.from, end: dateRange.to });
    }

    return matchesFilter && matchesSearch && matchesDate;
  });

  // Gatilho para gerar PDF automático via URL (vindo do Venux Acessor)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // 1. Verificar se há parâmetros de data na URL e atualizar o estado
    const fromParam = params.get('from');
    const toParam = params.get('to');

    if (fromParam && toParam) {
      const fromDate = new Date(fromParam);
      const toDate = new Date(toParam);

      // Só atualiza se for diferente para evitar loop
      if (dateRange?.from.getTime() !== fromDate.getTime() || dateRange?.to.getTime() !== toDate.getTime()) {
        setDateRange({ from: fromDate, to: toDate });
        return; // Espera o próximo ciclo com o estado atualizado
      }
    }

    // 2. Acionar o PDF se o parâmetro estiver presente
    if (params.get('generate_pdf') === 'true' && !isLoading && filteredTransactions.length > 0 && profile) {
      console.log("PDF: Gatilho automático detectado via URL.");
      generateTransactionsPDF(filteredTransactions, profile.full_name || 'Usuário', dateRange as any);

      // Limpa a URL para não gerar de novo no refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isLoading, filteredTransactions, profile, dateRange]);

  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const date = transaction.date || '';
    if (!acc[date]) acc[date] = [];
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const handleDelete = () => {
    if (!selectedTransaction) return;
    deleteTransaction(selectedTransaction.id, {
      onSuccess: () => { toast.success('Transação excluída!'); setSelectedTransaction(null); setShowDeleteDialog(false); },
      onError: (error) => toast.error('Erro ao excluir: ' + error.message),
    });
  };

  const handleDeleteClick = () => { if (!isPro) { setShowUpgrade(true); return; } setShowDeleteDialog(true); };

  useEffect(() => {
    if (showEdit && selectedTransaction) {
      setEditAmount(String(selectedTransaction.amount));
      setEditCategory(selectedTransaction.category);
      setEditDate(selectedTransaction.date);
      setEditType(selectedTransaction.type);
      setEditDescription(selectedTransaction.description);
    }
  }, [showEdit, selectedTransaction]);

  if (isLoading) {
    return (<MainLayout><div className="px-4 lg:px-6 py-4 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-full" /><div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-20 w-full rounded-xl" /></div>)}</div></div></MainLayout>);
  }

  return (
    <MainLayout>
      <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl lg:text-4xl font-black text-foreground tracking-tighter uppercase italic">
            Histórico <span className="text-primary">Financeiro</span>
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">Monitore cada entrada e saída para manter o equilíbrio.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center justify-between"
        >
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 bg-secondary border-none h-12 text-sm lg:text-base rounded-2xl focus-visible:ring-primary/20 transition-all w-full"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="flex-1 sm:w-44 bg-secondary border-none h-12 text-sm focus:ring-primary rounded-2xl">
                <Filter className="w-4 h-4 mr-2 text-primary" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas as Movimentações</SelectItem>
                <SelectItem value="income">Apenas Receitas</SelectItem>
                <SelectItem value="expense">Apenas Despesas</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-[2] sm:w-[280px] h-12 justify-start text-left font-normal bg-secondary border-none hover:bg-secondary/80 text-sm px-4 rounded-2xl shadow-sm transition-all",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <span className="truncate">
                        {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                      </span>
                    ) : (
                      format(dateRange.from, "dd/MM/yy")
                    )
                  ) : (
                    <span>Selecionar Período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border shadow-2xl rounded-2xl" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={{ from: dateRange?.from, to: dateRange?.to }}
                  onSelect={(range: any) => setDateRange(range)}
                  numberOfMonths={1}
                  locale={ptBR}
                  className="rounded-2xl border-none"
                />
              </PopoverContent>
            </Popover>

            <Button
              onClick={async () => {
                console.log("PDF: Gerando...");
                await generateTransactionsPDF(filteredTransactions, profile?.full_name || 'Usuário', dateRange as any);
              }}
              disabled={filteredTransactions.length === 0}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl gradient-primary border-0 font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group whitespace-nowrap order-last sm:order-none"
            >
              <FileDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Baixar Relatório</span>
            </Button>
          </div>
        </motion.div>

        {filteredTransactions.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-secondary/20 rounded-3xl"><p className="text-muted-foreground text-sm lg:text-base">Nenhuma transação encontrada para sua busca.</p></motion.div>}

        <div className="grid grid-cols-1 gap-6">
          {Object.entries(groupedTransactions).sort((a, b) => b[0].localeCompare(a[0])).map(([date, dateTransactions], groupIndex) => (
            <motion.div key={date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + groupIndex * 0.05 }}>
              <p className="text-xs lg:text-sm font-bold text-muted-foreground mb-3 px-1 uppercase tracking-wider">{new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-sm">
                {dateTransactions.map((transaction, index) => {
                  const iconName = categoryIcons[transaction.category] || 'Circle';
                  // @ts-ignore
                  const Icon = Icons[iconName] || Icons.Circle;
                  return (
                    <motion.div
                      key={transaction.id}
                      whileHover={{ backgroundColor: 'hsl(var(--secondary) / 0.8)' }}
                      onClick={() => setSelectedTransaction(transaction)}
                      className={cn('flex items-center gap-4 p-4 lg:p-5 cursor-pointer transition-all', index !== dateTransactions.length - 1 && 'border-b border-border')}
                    >
                      <div className={cn('p-3 rounded-xl shadow-sm', transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10')}>
                        <Icon className={cn('w-5 h-5', transaction.type === 'income' ? 'text-income' : 'text-expense')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm lg:text-base font-bold text-foreground truncate">{transaction.description}</p>
                        <p className="text-xs lg:text-sm text-muted-foreground font-medium">{transaction.category}</p>
                      </div>
                      <p className={cn('font-black financial-number text-base lg:text-lg', transaction.type === 'income' ? 'text-income' : 'text-expense')}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(Number(transaction.amount))}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Sheet open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <SheetContent className="w-full sm:max-w-sm bg-card border-border">
          {selectedTransaction && (
            <>
              <SheetHeader><SheetTitle className="text-foreground text-base">Detalhes da Transação</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center">
                  <div className={cn('p-4 rounded-xl', selectedTransaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10')}>
                    {(() => {
                      const iconName = categoryIcons[selectedTransaction.category] || 'Circle'; // @ts-ignore
                      const Icon = Icons[iconName] || Icons.Circle; return <Icon className={cn('w-8 h-8', selectedTransaction.type === 'income' ? 'text-income' : 'text-expense')} />;
                    })()}
                  </div>
                </div>
                <div className="text-center"><p className={cn('text-xl font-bold financial-number', selectedTransaction.type === 'income' ? 'text-income' : 'text-expense')}>{selectedTransaction.type === 'income' ? '+' : '-'} {formatCurrency(Number(selectedTransaction.amount))}</p><p className="text-sm text-muted-foreground mt-0.5">{selectedTransaction.description}</p></div>
                <div className="space-y-3 bg-secondary rounded-xl p-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Categoria</span><span className="font-medium text-foreground">{selectedTransaction.category}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Data</span><span className="font-medium text-foreground">{selectedTransaction.date && new Date(selectedTransaction.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tipo</span><span className={cn('font-medium', selectedTransaction.type === 'income' ? 'text-income' : 'text-expense')}>{selectedTransaction.type === 'income' ? 'Receita' : 'Despesa'}</span></div>
                  {selectedTransaction.payment_method && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Método</span><span className="font-medium text-foreground">{selectedTransaction.payment_method}</span></div>}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="w-full h-10 text-sm gap-2" onClick={() => setShowEdit(true)}>Editar Transação</Button>
                  <Button variant="destructive" className="w-full h-10 text-sm gap-2" onClick={handleDeleteClick}><Trash2 className="w-4 h-4" />{isPro ? 'Excluir Transação' : 'Excluir (PRO)'}</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {showEdit && (
        <AlertDialog open={showEdit} onOpenChange={open => { if (!open) setShowEdit(false); }}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Editar Transação</AlertDialogTitle>
              <AlertDialogDescription>Altere os dados da transação e salve.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="edit-amount">Valor</Label>
              <Input id="edit-amount" type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} min="0" step="0.01" />
              <Label htmlFor="edit-category">Categoria</Label>
              <Input id="edit-category" value={editCategory} onChange={e => setEditCategory(e.target.value)} />
              <Label htmlFor="edit-date">Data</Label>
              <Input id="edit-date" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
              <Label htmlFor="edit-type">Tipo</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger className="w-full p-2 rounded bg-secondary text-foreground text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="w-full max-w-xs">
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="edit-description">Descrição</Label>
              <Input id="edit-description" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
            </div>
            <AlertDialogFooter>
              <Button onClick={() => {
                if (!selectedTransaction) return;
                updateTransaction({
                  id: selectedTransaction.id,
                  amount: parseFloat(editAmount),
                  category: editCategory,
                  date: editDate,
                  type: editType,
                  description: editDescription
                }, {
                  onSuccess: (updated) => {
                    toast.success('Transação atualizada!');
                    setSelectedTransaction(updated);
                    setShowEdit(false);
                  },
                  onError: () => toast.error('Erro ao atualizar'),
                });
              }} disabled={isUpdating}>{isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}</Button>
              <AlertDialogCancel onClick={() => setShowEdit(false)}>Cancelar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}><AlertDialogContent className="bg-card border-border"><AlertDialogHeader><AlertDialogTitle>Excluir transação?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>{isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} feature="excluir transações" />
    </MainLayout>
  );
}
