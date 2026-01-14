import { useState, useEffect } from 'react';
import { X, Download, Share, Smartphone, PlusSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // 1. Check if suppressed by user previously (e.g., cookie/localStorage)
        const isDismissed = localStorage.getItem('venux_install_dismissed');
        if (isDismissed) return;

        // 2. Check for iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

        // Check if running in standalone mode (already installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) return; // Already installed, do nothing

        if (isIosDevice) {
            setIsIOS(true);
            setShowPrompt(true);
        }

        // 3. Check for Android/Chrome (beforeinstallprompt)
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault(); // Prevent mini-infobar
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Hide for 24 hours or permanently? Let's say permanently for now to avoid annoyance, 
        // or maybe store a timestamp to show again in 3 days.
        localStorage.setItem('venux_install_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-card border border-ai/20 shadow-2xl shadow-ai/20 rounded-3xl p-6 w-full max-w-sm pointer-events-auto relative z-10"
                    >
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-2 bg-muted/50 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="bg-ai/10 p-4 rounded-2xl">
                                <Download className="w-8 h-8 text-ai" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-black text-xl tracking-tight uppercase italic">
                                    Venux <span className="text-ai">no seu Celular</span>
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Instale para ter acesso instantâneo e não perder nenhum alerta de vencimento.
                                </p>
                            </div>

                            <div className="w-full">
                                {isIOS ? (
                                    <div className="flex flex-col gap-3 text-sm bg-secondary/30 p-4 rounded-2xl border border-border/50 text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                                <Share className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <span>1. Toque em <b>Compartilhar</b></span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-foreground/10 rounded-lg">
                                                <PlusSquare className="w-4 h-4 text-foreground" />
                                            </div>
                                            <span>2. Escolha <b>Adicionar à Tela de Início</b></span>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleInstallClick}
                                        className="w-full gap-3 font-bold h-12 text-base gradient-ai text-white border-0 shadow-lg shadow-ai/30 rounded-2xl"
                                    >
                                        <Smartphone className="w-5 h-5" />
                                        Instalar Agora
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
