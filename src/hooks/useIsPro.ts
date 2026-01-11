import { useProfile } from './useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { createCheckoutSession, createPortalSession } from '@/lib/stripe';
import { toast } from 'sonner';

export function useIsPro() {
  const { profile } = useProfile();
  const { user } = useAuth();

  const isPro = profile?.status_assinatura === 'ativo';

  const handleUpgrade = async (priceId: string) => {
    try {
      const checkoutUrl = await createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (error: any) {
      toast.error('Erro ao iniciar checkout: ' + error.message);
    }
  };

  const handleManageBilling = async () => {
    try {
      toast.loading('Abrindo portal de faturamento...', { id: 'portal' });
      const portalUrl = await createPortalSession();
      window.location.href = portalUrl;
    } catch (error: any) {
      toast.error('Erro ao abrir portal: ' + error.message, { id: 'portal' });
    }
  };

  const checkoutUrl = ''; // Mantido para compatibilidade, mas agora usamos handleUpgrade

  return {
    isPro,
    checkoutUrl,
    handleUpgrade,
    handleManageBilling,
    status: profile?.status_assinatura || 'free',
    planName: profile?.plano_nome || 'Gratuito',
  };
}
