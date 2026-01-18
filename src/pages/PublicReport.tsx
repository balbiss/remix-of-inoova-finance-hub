import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateTransactionsPDF } from '@/lib/pdf-generator';
import { Loader2, FileDown, AlertCircle } from 'lucide-react';

export default function PublicReport() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const generateReport = async () => {
            const whatsapp = searchParams.get('w');
            const from = searchParams.get('from');
            const to = searchParams.get('to');

            if (!whatsapp) {
                setStatus('error');
                setErrorMsg('Link de relatório inválido.');
                return;
            }

            try {
                // Chamamos nossa Edge Function para buscar os dados (ela ignora o RLS)
                const response = await fetch('https://hozwrepqajqvwjjmfwzw.supabase.co/functions/v1/venux-acessor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        auth_secret: 'PUBLIC_REPORT_REQUEST', // Pequena trava de segurança
                        whatsapp: whatsapp,
                        action: 'list_recent', // Usamos a lista para pegar os dados
                        data: { from, to }
                    })
                });

                const result = await response.json();

                if (result.error) throw new Error(result.error);

                // Gerar o PDF
                // Nota: list_recent retorna um objeto com { transactions, subscriptions, reminders }
                // Vamos usar apenas transactions para o PDF atual
                await generateTransactionsPDF(
                    result.transactions || [],
                    result.username || 'Usuário',
                    { from: from ? new Date(from) : new Date(), to: to ? new Date(to) : new Date() } as any
                );

                setStatus('success');

                // Fecha a aba após 3 segundos no celular
                setTimeout(() => window.close(), 3000);

            } catch (err: any) {
                console.error(err);
                setStatus('error');
                setErrorMsg(err.message || 'Erro ao gerar relatório.');
            }
        };

        generateReport();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-border shadow-2xl">
                {status === 'loading' && (
                    <div className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                            <Loader2 className="w-16 h-16 text-primary animate-spin relative mx-auto" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase italic mb-2">
                                Gerando <span className="text-primary">Relatório</span>
                            </h1>
                            <p className="text-muted-foreground text-sm">Aguarde um instante, estamos preparando tudo para você...</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                            <FileDown className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase italic mb-2">
                                Relatório <span className="text-primary">Pronto!</span>
                            </h1>
                            <p className="text-muted-foreground text-sm">O download deve começar automaticamente. Você já pode fechar esta aba.</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-10 h-10 text-destructive" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-destructive tracking-tight uppercase italic mb-2">
                                Ops! <span className="text-foreground">Ocorreu um erro</span>
                            </h1>
                            <p className="text-muted-foreground text-sm">{errorMsg}</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full h-12 rounded-2xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-all"
                        >
                            Ir para o site
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
