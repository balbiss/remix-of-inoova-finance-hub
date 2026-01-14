import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Config web-push
        webpush.setVapidDetails(
            'mailto:suporte@venux.com.br',
            Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
            Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
        )

        // 1. Get reminders due today or pending
        // Logic: remind_at is today OR (overdue AND status = pending)
        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]

        // For MVP, we'll fetch ALL pending reminders to check dates in JS or simple filter
        // ideally use a range filter in DB
        const { data: reminders, error: remindersError } = await supabaseClient
            .from('reminders')
            .select('*, profiles(id)')
            .eq('status', 'pending')
            .lte('remind_at', `${todayStr}T23:59:59`) // Due by end of today

        if (remindersError) throw remindersError

        console.log(`Found ${reminders?.length} pending reminders due`)

        const results = []

        for (const reminder of (reminders || [])) {
            // 2. Find subscription for this user
            const { data: subs, error: subsError } = await supabaseClient
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', reminder.user_id)

            if (subsError) {
                console.error(`Error fetching subs for user ${reminder.user_id}`, subsError)
                continue
            }

            // Send to all user devices
            for (const sub of (subs || [])) {
                try {
                    const payload = JSON.stringify({
                        title: `Lembrete: ${reminder.title}`,
                        body: `Valor: R$ ${reminder.valor || '0,00'} - Vence hoje! 💸`,
                        url: `https://venuxacessor.inoovaweb.com.br/reminders`
                    })

                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    }

                    await webpush.sendNotification(pushSubscription, payload)
                    results.push({ sent: true, reminder: reminder.title, user: reminder.user_id })

                    // Optional: Mark as 'sent' IF you only want to notify once
                    // For now we keep 'pending' until user marks as paid, 
                    // BUT successful automation might require a 'last_notified_at' column to avoid spamming every hour
                    // For MVP assuming this runs once a day via Cron.

                } catch (err) {
                    console.error('Failed to send push', err)
                    // If 410 Gone, delete subscription
                    if (err.statusCode === 410) {
                        await supabaseClient.from('push_subscriptions').delete().eq('id', sub.id)
                    }
                    results.push({ sent: false, error: err })
                }
            }
        }

        return new Response(JSON.stringify(results), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
