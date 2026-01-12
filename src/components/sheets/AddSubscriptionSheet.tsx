import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShoppingBag } from "lucide-react";

interface AddSubscriptionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddSubscriptionSheet({ open, onOpenChange }: AddSubscriptionSheetProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            name: "",
            amount: "",
            billing_cycle: "monthly",
            next_billing_date: new Date().toISOString().split("T")[0],
            category: "Entretenimento",
        }
    });

    const onSubmit = async (data: any) => {
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase.from("recurring_subscriptions").insert({
                user_id: user.id,
                name: data.name,
                amount: parseFloat(data.amount),
                billing_cycle: data.billing_cycle,
                next_billing_date: data.next_billing_date,
                category: data.category,
            });

            if (error) throw error;

            toast.success("Assinatura adicionada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["recurring_subscriptions"] });
            reset();
            onOpenChange(false);
        } catch (error: any) {
            toast.error("Erro ao adicionar assinatura: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md bg-card border-l border-border pt-10">
                <SheetHeader className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <SheetTitle className="text-2xl font-black uppercase italic tracking-tighter">
                        Nova Assinatura
                    </SheetTitle>
                    <SheetDescription className="text-sm font-medium">
                        Cadastre um serviço recorrente para que o Venux possa monitorar seus gastos automáticos.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider opacity-60">Nome do Serviço</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Netflix, Spotify, Academia"
                            {...register("name", { required: true })}
                            className="h-12 bg-secondary/50 border-border/50 focus:border-primary rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider opacity-60">Valor (R$)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                {...register("amount", { required: true })}
                                className="h-12 bg-secondary/50 border-border/50 focus:border-primary rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="billing_cycle" className="text-xs font-bold uppercase tracking-wider opacity-60">Ciclo</Label>
                            <Select onValueChange={(v) => setValue("billing_cycle", v)} defaultValue="monthly">
                                <SelectTrigger className="h-12 bg-secondary/50 border-border/50 focus:border-primary rounded-xl">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Mensal</SelectItem>
                                    <SelectItem value="yearly">Anual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="next_billing_date" className="text-xs font-bold uppercase tracking-wider opacity-60">Próximo Vencimento</Label>
                        <Input
                            id="next_billing_date"
                            type="date"
                            {...register("next_billing_date", { required: true })}
                            className="h-12 bg-secondary/50 border-border/50 focus:border-primary rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider opacity-60">Categoria</Label>
                        <Select onValueChange={(v) => setValue("category", v)} defaultValue="Entretenimento">
                            <SelectTrigger className="h-12 bg-secondary/50 border-border/50 focus:border-primary rounded-xl">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Entretenimento">Entretenimento</SelectItem>
                                <SelectItem value="Trabalho">Trabalho / SaaS</SelectItem>
                                <SelectItem value="Saúde">Saúde / Academia</SelectItem>
                                <SelectItem value="Educação">Educação</SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-wider transition-all shadow-xl shadow-primary/20 gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Assinatura"}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
