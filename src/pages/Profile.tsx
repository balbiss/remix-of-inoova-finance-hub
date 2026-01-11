import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useIsPro } from '@/hooks/useIsPro';
import { cn } from '@/lib/utils';
import { STRIPE_PLANS, syncSubscription } from '@/lib/stripe';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Crown,
  LogOut,
  Sparkles,
  Check,
  Loader2,
  Edit2,
  X,
  RefreshCw,
  CreditCard,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label as UILabel } from '@/components/ui/label';


export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { isPro, handleUpgrade } = useIsPro();
  const [whatsapp, setWhatsapp] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSaveWhatsapp = () => {
    updateProfile({ whatsapp }, {
      onSuccess: () => {
        toast.success('WhatsApp atualizado!');
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error('Erro ao atualizar: ' + error.message);
      },
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="px-4 lg:px-6 py-4 space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl lg:text-4xl font-black text-foreground tracking-tighter uppercase italic">
            Meu <span className="text-primary">Perfil</span>
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">Gerencie suas informações e detalhes da sua conta.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Left Column: Information (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm"
            >
              {/* Header with Avatar */}
              <div className="p-6 lg:p-10 border-b border-border">
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary/20 to-ai/20 flex items-center justify-center ring-4 ring-border/50">
                    <User className="w-8 h-8 lg:w-12 lg:h-12 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg lg:text-2xl font-black text-foreground tracking-tighter uppercase">
                      {profile?.full_name || 'Usuário'}
                    </h2>
                    <p className="text-xs lg:text-base text-muted-foreground font-medium">{user?.email}</p>
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-black px-3 py-1 uppercase tracking-widest',
                          isPro
                            ? 'bg-ai/10 text-ai border-ai/30'
                            : 'bg-muted text-muted-foreground border-border'
                        )}
                      >
                        {isPro ? <><Crown className="w-3.5 h-3.5 mr-1.5" />PRO</> : 'FREE'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Fields */}
              <div className="p-6 lg:p-10 space-y-6">
                <h3 className="text-[10px] lg:text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Informações de Contato
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {/* Email Row */}
                  <div className="space-y-2">
                    <UILabel className="text-[10px] font-bold text-muted-foreground uppercase ml-1">E-mail Principal</UILabel>
                    <div className="flex items-center gap-3 bg-secondary/40 rounded-2xl px-4 py-3 border border-transparent">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-xs lg:text-sm text-muted-foreground truncate flex-1 font-medium">
                        {user?.email}
                      </span>
                    </div>
                  </div>

                  {/* WhatsApp Row */}
                  <div className="space-y-2">
                    <UILabel className="text-[10px] font-bold text-muted-foreground uppercase ml-1">WhatsApp para Alertas</UILabel>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 flex-1 transition-all border",
                        isEditing ? "bg-background border-primary shadow-lg" : "bg-secondary/40 border-transparent"
                      )}>
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        {isEditing ? (
                          <Input
                            placeholder="(11) 99999-9999"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="h-auto p-0 text-xs lg:text-sm bg-transparent border-0 focus-visible:ring-0 font-medium"
                            autoFocus
                          />
                        ) : (
                          <span className={cn(
                            "text-xs lg:text-sm truncate flex-1 font-medium",
                            profile?.whatsapp ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {profile?.whatsapp || '(11) 99999-9999'}
                          </span>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="h-11 w-11 rounded-2xl text-muted-foreground"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            onClick={handleSaveWhatsapp}
                            disabled={isUpdating}
                            className="h-11 w-11 rounded-2xl bg-income hover:bg-income/90"
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => {
                            setWhatsapp(profile?.whatsapp || '');
                            setIsEditing(true);
                          }}
                          className="h-11 w-11 rounded-2xl text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-ai/5 border border-ai/10">
                  <Sparkles className="w-4 h-4 text-ai shrink-0" />
                  <p className="text-xs lg:text-sm text-ai font-medium leading-tight">
                    Mantenha seu WhatsApp atualizado para receber relatórios de insights da IA e lembretes de metas diretamente no celular.
                  </p>
                </div>
              </div>

              {/* Logout */}
              <div className="p-4 bg-muted/20 border-t border-border flex justify-end">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="h-10 text-xs lg:text-sm font-bold text-expense hover:text-expense hover:bg-expense/10 px-6 rounded-xl"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Plan Info (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-[32px] p-6 lg:p-8 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] lg:text-xs font-black text-muted-foreground uppercase tracking-wider">Status do Plano</h3>
                <Badge className={cn("rounded-full", isPro ? "bg-ai text-white" : "bg-muted text-muted-foreground")}>
                  {isPro ? 'Ativo' : 'Básico'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-[24px] bg-secondary/40 border border-transparent">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", isPro ? "bg-ai/20 text-ai" : "bg-muted text-muted-foreground")}>
                    <Crown className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm lg:text-base font-bold text-foreground">
                      {profile?.plano_nome || (isPro ? 'Plano PRO' : 'Assinatura Gratuita')}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      Pacote {isPro ? 'Mensal' : 'limitado'}
                    </p>
                  </div>
                </div>

                {isPro && (
                  <div className="p-4 rounded-[24px] border border-ai/20 bg-ai/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-ai" />
                        <span className="text-[10px] lg:text-xs text-muted-foreground font-bold uppercase tracking-tight">Vencimento</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-ai hover:bg-ai/20 rounded-full"
                        onClick={async (e) => {
                          e.stopPropagation();
                          toast.loading("Sincronizando...", { id: "sync" });
                          try {
                            await syncSubscription();
                            toast.success("Dados atualizados!", { id: "sync" });
                            window.location.reload();
                          } catch (e: any) {
                            toast.error("Erro: " + e.message, { id: "sync" });
                          }
                        }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-base lg:text-lg font-black text-foreground tracking-tighter">
                      {profile?.data_expiracao ? new Date(profile.data_expiracao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '---'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => navigate('/subscription')}
                  className="w-full h-11 rounded-2xl gradient-primary border-0 font-bold text-xs lg:text-sm shadow-lg shadow-primary/20"
                >
                  {isPro ? 'Gerenciar Assinatura' : 'Fazer Upgrade para PRO'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium">
                  <CreditCard className="w-3 h-3" />
                  Processamento seguro via Stripe
                </div>
              </div>
            </motion.div>

            {/* Loyalty / Benefits Mini Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card/50 border border-border/60 rounded-[32px] p-6 shadow-sm"
            >
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Vantagens do Perfil</h4>
              <div className="space-y-3">
                {[
                  { icon: Check, text: "Histórico Ilimitado", checked: isPro },
                  { icon: Check, text: "Suporte via WhatsApp", checked: isPro },
                  { icon: Check, text: "Relatórios de Exportação", checked: isPro },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", item.checked ? "bg-income/20 text-income" : "bg-muted text-muted-foreground")}>
                      <item.icon className="w-2.5 h-2.5" />
                    </div>
                    <span className={cn("text-xs font-medium", item.checked ? "text-foreground" : "text-muted-foreground/60")}>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Upgrade Section for Non-PRO - Only shown if not PRO and on Desktop grid space allow or below */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 lg:mt-20 space-y-12"
          >
            <div className="text-center space-y-4">
              <h3 className="text-xl lg:text-3xl font-black text-foreground uppercase tracking-tighter">Escolha seu <span className="text-ai">Plano</span></h3>
              <p className="text-xs lg:text-base text-muted-foreground max-w-2xl mx-auto">Desenvolva sua saúde financeira com ferramentas de nível profissional e suporte dedicado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Monthly Plan */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative group p-8 rounded-[40px] bg-card border border-border flex flex-col items-center text-center space-y-6 shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                <div className="space-y-1">
                  <h4 className="text-lg lg:text-xl font-black text-foreground uppercase italic tracking-tight">{STRIPE_PLANS.MENSAL.name}</h4>
                  <p className="text-xs text-muted-foreground uppercase font-semibold opacity-60">Ideal para começar</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-black text-muted-foreground">R$</span>
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter">39,90</span>
                  <span className="text-xs text-muted-foreground font-bold">/mês</span>
                </div>

                <div className="w-full space-y-3 py-4 border-y border-border/50">
                  {[
                    "Gestão Financeira Completa",
                    "Lembretes via WhatsApp",
                    "Alertas Inteligentes",
                    "Dashboard de Extratos",
                    "Suporte Exclusivo"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs lg:text-sm text-muted-foreground text-left">
                      <div className="w-5 h-5 rounded-full bg-ai/10 flex items-center justify-center shrink-0 border border-ai/20">
                        <Check className="w-3 h-3 text-ai" />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleUpgrade(STRIPE_PLANS.MENSAL.id)}
                  variant="outline"
                  className="w-full h-12 rounded-2xl text-sm font-bold shadow-sm hover:bg-secondary transition-all"
                >
                  Assinar Agora <Sparkles className="w-4 h-4 ml-2 text-ai" />
                </Button>
                <p className="text-[10px] text-muted-foreground font-medium italic">Sem fidelidade • Cancele quando desejar</p>
              </motion.div>

              {/* Quarterly Plan (Popular) */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative group p-8 rounded-[40px] bg-secondary/50 border-2 border-ai/40 flex flex-col items-center text-center space-y-6 shadow-ai/10 shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-10 -mr-20 -mt-10 bg-ai/10 rounded-full blur-3xl" />

                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-ai text-white text-[10px] px-4 py-1.5 font-black uppercase tracking-widest border-0 h-auto rounded-full shadow-lg shadow-ai/30">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> O Mais Procurado
                  </Badge>
                </div>

                <div className="space-y-1 pt-6">
                  <h4 className="text-lg lg:text-xl font-black text-foreground uppercase italic tracking-tight">{STRIPE_PLANS.TRIMESTRAL.name}</h4>
                  <p className="text-xs text-ai font-black uppercase tracking-widest">Economia Imediata</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-muted-foreground">R$</span>
                    <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter">29,90</span>
                    <span className="text-xs text-muted-foreground font-bold">/mês</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-bold mt-2 uppercase opacity-60">
                    Cobrado a cada 3 meses (R$ 89,70)
                  </span>
                  <Badge variant="outline" className="bg-income/10 text-income border-income/30 text-[10px] font-black mt-2 uppercase tracking-tight py-1">
                    Economize R$ 120 por ano
                  </Badge>
                </div>

                <div className="w-full space-y-3 py-4 border-y border-ai/10">
                  {[
                    "Todos os recursos do Mensal",
                    "Acesso antecipado a novidades",
                    "Gestão de múltiplos orçamentos",
                    "Exportação de relatórios PDF/Excel",
                    "Suporte VIP prioritário"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs lg:text-sm text-muted-foreground text-left">
                      <div className="w-5 h-5 rounded-full bg-ai/20 flex items-center justify-center shrink-0 border border-ai/40">
                        <Check className="w-3 h-3 text-ai" />
                      </div>
                      <span className="font-bold text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleUpgrade(STRIPE_PLANS.TRIMESTRAL.id)}
                  className="w-full h-12 rounded-2xl text-sm font-black gradient-ai text-white shadow-xl shadow-ai/30 group-hover:scale-[1.02] transition-all"
                >
                  Assinar Agora <Sparkles className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-[10px] text-muted-foreground font-medium italic">Garantia de satisfação Venux</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
