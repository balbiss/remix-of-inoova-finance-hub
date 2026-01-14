import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, UtensilsCrossed, Car, ShoppingCart, Zap, Tv, Briefcase, Gift, Loader2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from 'sonner';

interface AddTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: 'Alimentação', label: 'Alimentação', icon: UtensilsCrossed },
  { value: 'Transporte', label: 'Transporte', icon: Car },
  { value: 'Mercado', label: 'Mercado', icon: ShoppingCart },
  { value: 'Contas', label: 'Contas', icon: Zap },
  { value: 'Streaming', label: 'Streaming', icon: Tv },
  { value: 'Trabalho', label: 'Trabalho', icon: Briefcase },
  { value: 'Outros', label: 'Outros', icon: Gift },
];

import { useIsPro } from '@/hooks/useIsPro';
import { useNavigate } from 'react-router-dom';

export function AddTransactionSheet({ open, onOpenChange }: AddTransactionSheetProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const { createTransaction, isCreating } = useTransactions();
  const { isPro } = useIsPro();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPro) {
      toast.error('Funcionalidade exclusiva para assinantes Pro!');
      onOpenChange(false);
      navigate('/subscription');
      return;
    }

    if (!amount || !description || !category) {
      toast.error('Preencha todos os campos');
      return;
    }

    createTransaction(
      { type, amount: parseFloat(amount), description, category },
      {
        onSuccess: () => {
          toast.success('Transação adicionada!');
          onOpenChange(false);
          setAmount('');
          setDescription('');
          setCategory('');
        },
        onError: (error) => {
          toast.error('Erro: ' + error.message);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] sm:h-auto sm:max-w-sm bg-card border-border rounded-t-[32px] sm:rounded-l-xl p-6 transition-all duration-500 ease-in-out"
      >
        <div className="bottom-sheet-handle lg:hidden" />
        <SheetHeader className="text-left sm:text-center">
          <SheetTitle className="text-foreground text-xl font-black italic uppercase tracking-tight">Nova Transação</SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs font-medium">Configure os detalhes da sua movimentação financeira.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex gap-1.5 p-1 bg-secondary rounded-lg">
            <button type="button" onClick={() => setType('expense')} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md transition-all duration-200 text-sm font-medium', type === 'expense' ? 'bg-expense text-expense-foreground shadow-md' : 'text-muted-foreground')}>
              <ArrowUpRight className="w-3.5 h-3.5" />Despesa
            </button>
            <button type="button" onClick={() => setType('income')} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md transition-all duration-200 text-sm font-medium', type === 'income' ? 'bg-income text-income-foreground shadow-md' : 'text-muted-foreground')}>
              <ArrowDownLeft className="w-3.5 h-3.5" />Receita
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-foreground text-xs">Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">R$</span>
              <Input id="amount" type="number" step="0.01" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-10 h-12 text-xl font-semibold financial-number bg-secondary border-none" disabled={isCreating} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-foreground text-xs">Descrição</Label>
            <Input id="description" placeholder="Ex: Almoço no restaurante" value={description} onChange={(e) => setDescription(e.target.value)} className="h-10 bg-secondary border-none text-sm" disabled={isCreating} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Categoria</Label>
            <Select value={category} onValueChange={setCategory} disabled={isCreating}>
              <SelectTrigger className="h-10 bg-secondary border-none text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return <SelectItem key={cat.value} value={cat.value}><div className="flex items-center gap-2"><Icon className="w-3.5 h-3.5" /><span className="text-sm">{cat.label}</span></div></SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isCreating} className={cn('w-full h-11 text-sm font-semibold rounded-lg', type === 'expense' ? 'bg-expense hover:bg-expense/90' : 'bg-income hover:bg-income/90')}>
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : `Adicionar ${type === 'expense' ? 'Despesa' : 'Receita'}`}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
