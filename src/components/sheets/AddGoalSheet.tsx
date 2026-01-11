import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGoals } from '@/hooks/useGoals';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGoalSheet({ open, onOpenChange }: AddGoalSheetProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState('savings');
  const [deadline, setDeadline] = useState('');
  const { createGoal, isCreating } = useGoals();
  const { toast } = useToast();

  const isLoading = isCreating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !targetAmount) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      toast({
        title: 'Erro',
        description: 'Digite um valor válido',
        variant: 'destructive',
      });
      return;
    }

    createGoal({
      name,
      description,
      target_amount: target,
      current_amount: 0,
      category,
      deadline: deadline || null,
      status: 'active',
    });

    toast({
      title: 'Sucesso',
      description: 'Meta criada com sucesso!',
    });

    setName('');
    setDescription('');
    setTargetAmount('');
    setCategory('savings');
    setDeadline('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] sm:h-auto sm:max-w-sm bg-card border-border rounded-t-[32px] sm:rounded-l-xl p-6 transition-all duration-500 ease-in-out"
      >
        <div className="bottom-sheet-handle lg:hidden" />
        <SheetHeader className="text-left sm:text-center">
          <SheetTitle className="text-foreground text-xl font-black italic uppercase tracking-tight">Nova Meta</SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs font-medium">
            Crie uma meta financeira para organizar seus objetivos.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-6">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Nome da Meta *</Label>
            <Input
              id="goal-name"
              placeholder="Ex: Fundo de Emergência"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-description">Descrição</Label>
            <Textarea
              id="goal-description"
              placeholder="Detalhes sobre sua meta (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-amount">Valor Alvo (R$) *</Label>
            <Input
              id="target-amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger id="goal-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Poupança</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
                <SelectItem value="debt">Pagar Dívida</SelectItem>
                <SelectItem value="vacation">Férias</SelectItem>
                <SelectItem value="education">Educação</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo (opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Criando...' : 'Criar Meta'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
