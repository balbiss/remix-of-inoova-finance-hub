import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.1.0?target=deno&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

serve(async (req) => {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        console.error("ERRO: Assinatura Stripe ausente nos cabeçalhos.");
        return new Response("Assinatura ausente", { status: 400 });
    }

    try {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
            apiVersion: "2024-06-20",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const body = await req.text();
        const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
        let event;

        if (webhookSecret) {
            try {
                event = await stripe.webhooks.constructEventAsync(
                    body,
                    signature,
                    webhookSecret
                );
            } catch (err) {
                console.error(`ERRO ao verificar assinatura: ${err.message}`);
                return new Response(`Webhook Error: ${err.message}`, { status: 400 });
            }
        } else {
            console.warn("AVISO: STRIPE_WEBHOOK_SECRET não configurado. Usando parsing simples de JSON.");
            event = JSON.parse(body);
        }

        console.log(`EVENTO RECEBIDO: ${event.type}`);

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const customerId = session.customer;
                const subscriptionId = session.subscription;
                const userId = session.client_reference_id; // ID do usuário no Supabase

                console.log(`PROCESSANDO checkout.session.completed para cliente: ${customerId}, UserID: ${userId}`);

                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0].price.id;
                const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
                const activationDate = new Date(subscription.created * 1000).toISOString();

                // Construção do objeto de atualização
                const updateData = {
                    status_assinatura: "ativo",
                    stripe_subscription_id: subscriptionId,
                    stripe_price_id: priceId,
                    plano_nome: "PRO",
                    data_expiracao: currentPeriodEnd,
                    data_ativacao: activationDate,
                    stripe_customer_id: customerId // Garante que o ID do cliente esteja salvo
                };

                let error;

                // ESTRATÉGIA BLINDADA: Tenta atualizar pelo ID do usuário primeiro (mais seguro)
                if (userId) {
                    const result = await supabaseClient
                        .from("profiles")
                        .update(updateData)
                        .eq("id", userId);
                    error = result.error;
                } else {
                    // Fallback para buscar pelo stripe_customer_id (caso antigo)
                    const result = await supabaseClient
                        .from("profiles")
                        .update(updateData)
                        .eq("stripe_customer_id", customerId);
                    error = result.error;
                }

                if (error) {
                    console.error(`ERRO ao atualizar banco de dados: ${error.message}`);
                } else {
                    console.log(`SUCESSO: Perfil atualizado para PRO | Cliente: ${customerId} | User: ${userId || 'N/A'}`);
                }
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                console.log(`PROCESSANDO cancelamento de assinatura: ${subscription.id}`);

                await supabaseClient
                    .from("profiles")
                    .update({
                        status_assinatura: "cancelado",
                        plano_nome: "Gratuito",
                    })
                    .eq("stripe_subscription_id", subscription.id);
                break;
            }
            case "customer.subscription.updated": {
                const subscription = event.data.object;
                const status = subscription.status === "active" ? "ativo" : "pendente";
                const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

                console.log(`PROCESSANDO atualização de assinatura: ${subscription.id} -> ${status}`);

                await supabaseClient
                    .from("profiles")
                    .update({
                        status_assinatura: status,
                        data_expiracao: currentPeriodEnd,
                    })
                    .eq("stripe_subscription_id", subscription.id);
                break;
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("ERRO inesperado no webhook:", error.message);
        return new Response(`Webhook Error: ${error.message}`, { status: 400 });
    }
});
