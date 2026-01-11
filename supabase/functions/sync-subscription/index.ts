import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.1.0?target=deno&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const authHeader = req.headers.get("Authorization")!;
        const { data: { user }, error: authError } = await createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: authHeader } } }
        ).auth.getUser();

        if (authError || !user) {
            throw new Error("Não autorizado");
        }

        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
            apiVersion: "2024-06-20",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const { data: profile } = await supabaseClient
            .from("profiles")
            .select("stripe_customer_id, stripe_subscription_id")
            .eq("id", user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            return new Response(JSON.stringify({ message: "Nenhum cliente Stripe associado" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        // List subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: "active",
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            // If no active subscription, check if they were cancelled but still in period
            const allSubs = await stripe.subscriptions.list({
                customer: profile.stripe_customer_id,
                limit: 1,
            });

            if (allSubs.data.length === 0) {
                return new Response(JSON.stringify({ message: "Nenhuma assinatura encontrada" }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                });
            }

            // Found something (maybe cancelled/past_due)
            const sub = allSubs.data[0];
            const currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();

            await supabaseClient
                .from("profiles")
                .update({
                    status_assinatura: sub.status === "active" ? "ativo" : "cancelado",
                    data_expiracao: currentPeriodEnd,
                })
                .eq("id", user.id);

            return new Response(JSON.stringify({ success: true, message: "Status atualizado" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        const subscription = subscriptions.data[0];
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const activationDate = new Date(subscription.created * 1000).toISOString();
        const priceId = subscription.items.data[0].price.id;

        await supabaseClient
            .from("profiles")
            .update({
                status_assinatura: "ativo",
                stripe_subscription_id: subscription.id,
                stripe_price_id: priceId,
                plano_nome: "PRO",
                data_expiracao: currentPeriodEnd,
                data_ativacao: activationDate,
            })
            .eq("id", user.id);

        return new Response(JSON.stringify({ success: true, message: "Dados sincronizados com sucesso" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Erro na sincronização:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
