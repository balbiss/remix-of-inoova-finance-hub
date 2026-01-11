import { motion } from 'framer-motion';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsPro } from '@/hooks/useIsPro';

interface UpgradeOverlayProps {
  title?: string;
  description?: string;
  className?: string;
}

export function UpgradeOverlay({
  title = 'Recurso PRO',
  description = 'Assine o plano PRO para desbloquear esta funcionalidade',
  className = '',
}: UpgradeOverlayProps) {
  const { checkoutUrl } = useIsPro();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl ${className}`}
    >
      <div className="text-center p-6 space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
        </div>
        <Button onClick={() => window.location.href = '/profile'} className="gap-2">
          <Crown className="w-4 h-4" />
          Escolher Plano
        </Button>
      </div>
    </motion.div>
  );
}
