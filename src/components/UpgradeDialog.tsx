import { Crown, Sparkles, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsPro } from '@/hooks/useIsPro';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

const benefits = [
  'Criar transações ilimitadas',
  'Criar e gerenciar metas',
  'Lembretes via WhatsApp',
  'Projeção financeira anual',
  'Relatórios detalhados',
];

export function UpgradeDialog({ open, onOpenChange, feature }: UpgradeDialogProps) {
  const { checkoutUrl } = useIsPro();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl">Seja PRO</DialogTitle>
          <DialogDescription className="text-center">
            {feature
              ? `Para ${feature}, você precisa de uma assinatura ativa.`
              : 'Desbloqueie todas as funcionalidades do app.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        <Button onClick={() => { onOpenChange(false); window.location.href = '/profile'; }} size="lg" className="w-full gap-2 gradient-ai">
          <Sparkles className="w-4 h-4" />
          Escolher Plano
        </Button>
      </DialogContent>
    </Dialog>
  );
}
