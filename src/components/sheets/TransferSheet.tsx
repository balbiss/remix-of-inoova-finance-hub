import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TransferSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferSheet({ open, onOpenChange }: TransferSheetProps) {
  const [fromAccount, setFromAccount] = useState('checking');
  const [toAccount, setToAccount] = useState('savings');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount) {
      toast({
        title: 'Erro',
        description: 'Digite o valor a transferir',
        variant: 'destructive',
      });
      return;
    }

    if (fromAccount === toAccount) {
      toast({
        title: 'Erro',
        description: 'Selecione contas diferentes',
        variant: 'destructive',
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: 'Erro',
        description: 'Digite um valor válido',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Simular transferência (em produção, isso seria uma API call)
      // A lógica real de transferência seria implementada aqui
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: 'Sucesso',
        description: `Transferência de R$ ${transferAmount.toFixed(2)} realizada com sucesso!`,
      });

      setAmount('');
      setDescription('');
      setFromAccount('checking');
      setToAccount('savings');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao realizar transferência',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
          <SheetTitle className="text-foreground text-xl font-black italic uppercase tracking-tight">Transferência</SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs font-medium">
            Transfira dinheiro entre suas contas com segurança.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-6">
          <div className="space-y-2">
            <Label htmlFor="from-account">De (Conta Origem) *</Label>
            <Select value={fromAccount} onValueChange={setFromAccount} disabled={isLoading}>
              <SelectTrigger id="from-account">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
                <SelectItem value="emergency">Fundo de Emergência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-account">Para (Conta Destino) *</Label>
            <Select value={toAccount} onValueChange={setToAccount} disabled={isLoading}>
              <SelectTrigger id="to-account">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
                <SelectItem value="emergency">Fundo de Emergência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-amount">Valor (R$) *</Label>
            <Input
              id="transfer-amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-description">Descrição (opcional)</Label>
            <Textarea
              id="transfer-description"
              placeholder="Motivo da transferência"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Transferindo...' : 'Transferir'}
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
