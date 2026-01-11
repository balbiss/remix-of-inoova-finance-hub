import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, ArrowRight, X, Phone, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useIsPro } from '@/hooks/useIsPro';
import { cn } from '@/lib/utils';

// Persistent session flag to prevent re-popups during navigation
let sessionHasInteracted = false;

export function VenuxAgent() {
    const { profile, updateProfile, isLoading } = useProfile();
    const { isPro } = useIsPro();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // If profile loaded and has whatsapp OR already onboarded, don't show
        if (!isLoading && profile) {
            if (profile.whatsapp || profile.has_onboarded || sessionHasInteracted) {
                // If they have whatsapp but haven't marked as onboarded, do it silently
                if (profile.whatsapp && !profile.has_onboarded) {
                    updateProfile({ has_onboarded: true });
                }
                return;
            }

            // Show after a delay if terms met
            const timer = setTimeout(() => {
                if (!sessionHasInteracted) setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [profile, isLoading, isVisible]);

    const handleClose = () => {
        setIsVisible(false);
        sessionHasInteracted = true;
    };

    const handleComplete = () => {
        sessionHasInteracted = true;
        updateProfile({ has_onboarded: true });
        setIsVisible(false);
        navigate('/profile');
    };

    const steps = [
        {
            title: `Olá ${profile?.full_name?.split(' ')[0] || 'amigo(a)'}!`,
            content: "Tudo bem! Sou o Venux, seu assessor financeiro inteligente. Estou aqui para transformar sua relação com o dinheiro.",
            icon: Sparkles,
            iconColor: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            title: "O Segredo está no WhatsApp",
            content: !isPro
                ? "Vejo que você ainda não tem uma assinatura ativa. Com o Plano PRO, eu posso te avisar sobre cada vencimento e dar insights automáticos diretamente no seu WhatsApp."
                : "Como você é um usuário PRO, eu vou te enviar alertas inteligentes e relatórios automáticos diretamente no seu WhatsApp.",
            icon: MessageCircle,
            iconColor: 'text-ai',
            bgColor: 'bg-ai/10'
        },
        {
            title: "Configuração Vital",
            content: "É muito importante que você coloque seu número de WhatsApp na aba de Perfil. Eu só consigo te responder e enviar alertas para o número cadastrado lá!",
            icon: Phone,
            iconColor: 'text-income',
            bgColor: 'bg-income/10'
        },
        {
            title: "Vamos Começar?",
            content: "Pronto para organizar sua vida financeira? Comece cadastrando seus primeiros gastos para eu entender seu perfil!",
            icon: CheckCircle2,
            iconColor: 'text-primary',
            bgColor: 'bg-primary/10'
        }
    ];

    if (!isVisible) return null;

    const currentStep = steps[step];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-lg bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden"
                >
                    {/* Header Gradient */}
                    <div className="h-2 w-full bg-gradient-to-r from-primary via-ai to-primary opacity-50" />

                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-3 rounded-2xl", currentStep.bgColor)}>
                                <currentStep.icon className={cn("w-8 h-8", currentStep.iconColor)} />
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">
                                {currentStep.title}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {currentStep.content}
                            </p>
                        </motion.div>

                        {/* Stepper Dots */}
                        <div className="flex gap-2 my-8">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        i === step ? "w-8 bg-primary" : "w-2 bg-secondary"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3">
                            {step > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(s => s - 1)}
                                    className="rounded-xl h-12 px-6 font-bold"
                                >
                                    Voltar
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    if (step < steps.length - 1) {
                                        setStep(s => s + 1);
                                    } else {
                                        handleComplete();
                                    }
                                }}
                                className="flex-1 rounded-xl h-12 font-bold gap-2 gradient-primary border-0 shadow-lg shadow-primary/20"
                            >
                                {step === steps.length - 1 ? 'Começar Jornada' : 'Próximo'}
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
