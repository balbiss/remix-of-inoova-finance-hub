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
            // Delay showing on iOS to not be annoying immediately
            setTimeout(() => setShowPrompt(true), 3000);
        }

        // 3. Check for Android/Chrome (beforeinstallprompt)
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault(); // Prevent mini-infobar
            setDeferredPrompt(e);
            setTimeout(() => setShowPrompt(true), 3000);
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
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 md:pb-4 flex justify-center pointer-events-none"
                >
                    <div className="bg-background border border-ai/20 shadow-xl shadow-ai/10 rounded-2xl p-4 w-full max-w-sm pointer-events-auto relative">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 p-1.5 bg-muted/50 rounded-full hover:bg-muted text-muted-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4 pr-6">
                            <div className="bg-ai/10 p-3 rounded-xl shrink-0">
                                <Download className="w-6 h-6 text-ai" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-base mb-1">Instale o Venux App</h3>
                                <p className="text-sm text-muted-foreground leading-snug mb-3">
                                    Tenha acesso mais rápido e receba notificações direto na tela do seu celular.
                                </p>

                                {isIOS ? (
                                    // iOS Instructions
                                    <div className="flex flex-col gap-2 text-xs bg-secondary/30 p-2 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-2">
                                            <Share className="w-4 h-4 text-blue-500" />
                                            <span>1. Toque em <b>Compartilhar</b></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <PlusSquare className="w-4 h-4 text-foreground" />
                                            <span>2. Escolha <b>Adicionar à Tela de Início</b></span>
                                        </div>
                                    </div>
                                ) : (
                                    // Android Button
                                    <Button
                                        onClick={handleInstallClick}
                                        className="w-full gap-2 font-bold gradient-ai text-white border-0 shadow-lg shadow-ai/20"
                                    >
                                        <Smartphone className="w-4 h-4" />
                                        Instalar Agora
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
