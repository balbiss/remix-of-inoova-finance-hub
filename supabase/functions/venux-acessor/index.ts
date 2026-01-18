import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { whatsapp, action, data, auth_secret } = await req.json()

        // Segurança: Só aceita se tiver a Service Role Key (n8n) OU o segredo da página pública
        const authHeader = req.headers.get('Authorization')
        if (!authHeader && auth_secret !== 'PUBLIC_REPORT_REQUEST') {
            return new Response(
                JSON.stringify({ error: 'Não autorizado' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        if (!whatsapp) {
            throw new Error('Número de WhatsApp não fornecido')
        }

        // 1. Buscar o usuário pelo WhatsApp
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('id, full_name, status_assinatura')
            .eq('whatsapp', whatsapp)
            .single()

        if (profileError || !profile) {
            return new Response(
                JSON.stringify({ error: 'Usuário não encontrado com este WhatsApp' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
        }

        // 1.5 Verificar se a assinatura está ativa
        if (profile.status_assinatura !== 'ativo') {
            return new Response(
                JSON.stringify({
                    error: 'Acesso negado',
                    message: 'Sua assinatura não está ativa. Por favor, regularize seu plano no painel do Inoova Finance.'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
        }

        const userId = profile.id
        let result = null

        // 2. Executar a ação solicitada
        switch (action) {
            case 'get_report':
                const siteUrl = Deno.env.get('SITE_URL') || 'https://seu-saas.com'
                const from = data.from ? `&from=${data.from}` : ''
                const to = data.to ? `&to=${data.to}` : ''
                // Mudamos o link para a nova rota pública /report
                result = {
                    message: 'Aqui está o link para baixar seu relatório PDF:',
                    link: `${siteUrl}/report?w=${whatsapp}${from}${to}`
                }
                break

            case 'add_transaction':
                const { data: tx, error: txErr } = await supabaseClient
                    .from('transactions')
                    .insert({
                        user_id: userId,
                        amount: data.amount,
                        category: data.category || 'Outros',
                        description: data.description,
                        type: data.type || 'expense',
                        date: new Date().toISOString()
                    })
                    .select()
                    .single()
                if (txErr) throw txErr
                result = { message: 'Transação salva com sucesso!', item: tx }
                break

            case 'add_subscription':
                const { data: sub, error: subErr } = await supabaseClient
                    .from('recurring_subscriptions')
                    .insert({
                        user_id: userId,
                        name: data.name,
                        amount: data.amount,
                        category: data.category || 'Assinatura',
                        next_billing_date: data.next_billing_date || new Date().toISOString(),
                        billing_cycle: data.billing_cycle || 'monthly'
                    })
                    .select()
                    .single()
                if (subErr) throw subErr
                result = { message: 'Assinatura cadastrada!', item: sub }
                break

            case 'add_reminder':
                const { data: rem, error: remErr } = await supabaseClient
                    .from('reminders')
                    .insert({
                        user_id: userId,
                        title: data.title,
                        remind_at: data.remind_at,
                        status: 'pending'
                    })
                    .select()
                    .single()
                if (remErr) throw remErr
                result = { message: 'Lembrete criado!', item: rem }
                break

            case 'get_summary':
                const { data: summary, error: sumErr } = await supabaseClient
                    .from('transactions')
                    .select('amount, type')
                    .eq('user_id', userId)
                if (sumErr) throw sumErr

                const totalBalance = summary.reduce((acc: number, curr: any) =>
                    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
                )
                result = { balance: totalBalance, name: profile.full_name }
                break

            case 'list_recent':
                const { data: txs } = await supabaseClient.from('transactions').select('id, description, amount, date').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
                const { data: subs } = await supabaseClient.from('recurring_subscriptions').select('id, name, amount').eq('user_id', userId).limit(5)
                const { data: rems } = await supabaseClient.from('reminders').select('id, title, remind_at').eq('user_id', userId).eq('status', 'pending').limit(5)
                result = { transactions: txs, subscriptions: subs, reminders: rems, username: profile.full_name }
                break

            case 'delete_item':
                const { table: delTable, id: delId } = data
                const { error: delErr } = await supabaseClient
                    .from(delTable)
                    .delete()
                    .eq('id', delId)
                    .eq('user_id', userId)
                if (delErr) throw delErr
                result = { message: 'Item removido com sucesso!' }
                break

            case 'update_item':
                const { table: updTable, id: updId, newData } = data
                const { data: updItem, error: updErr } = await supabaseClient
                    .from(updTable)
                    .update(newData)
                    .eq('id', updId)
                    .eq('user_id', userId)
                    .select()
                    .single()
                if (updErr) throw updErr
                result = { message: 'Item atualizado com sucesso!', item: updItem }
                break

            default:
                throw new Error('Ação inválida')
        }

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
