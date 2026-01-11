import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useReminders } from '@/hooks/useReminders';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddReminderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddReminderSheet({ open, onOpenChange }: AddReminderSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [category, setCategory] = useState('finance');
  const [valor, setValor] = useState('');
  const { createReminder, isCreating } = useReminders();
  const { toast } = useToast();

  const isLoading = isCreating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !remindAt) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        createReminder(
          {
            title,
            remind_at: remindAt,
            status: 'pending',
            category,
            valor: valor ? parseFloat(valor.replace(',', '.')) : null
          },
          {
            onSuccess: () => resolve(true),
            onError: (error: any) => reject(error)
          }
        );
      });
      toast({
        title: 'Sucesso',
        description: 'Lembrete criado com sucesso!',
      });
      setTitle('');
      setDescription('');
      setRemindAt('');
      setCategory('finance');
      setValor('');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error?.message || 'Erro ao criar lembrete',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] sm:h-auto sm:max-w-sm bg-card border-border rounded-t-[32px] sm:rounded-l-xl p-6 transition-all duration-500 ease-in-out"
      >
        <div className="bottom-sheet-handle lg:hidden" />
        <SheetHeader className="text-left sm:text-center">
          <SheetTitle className="text-foreground text-xl font-black italic uppercase tracking-tight">Novo Lembrete</SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs font-medium">
            Configure um lembrete para não esquecer de nada importante.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Pagar conta de luz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (opcional)</Label>
            <Input
              id="valor"
              type="number"
              placeholder="Ex: 100.00"
              value={valor}
              onChange={e => setValor(e.target.value)}
              className="bg-secondary border-none h-9 text-sm"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remind-at">Data e Hora *</Label>
            <Input
              id="remind-at"
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finance">Finanças</SelectItem>
                <SelectItem value="personal">Pessoal</SelectItem>
                <SelectItem value="health">Saúde</SelectItem>
                <SelectItem value="work">Trabalho</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Criando...' : 'Criar Lembrete'}
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
