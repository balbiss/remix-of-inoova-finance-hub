How to deploy `send_reminders` Supabase Edge Function and schedule it (Brazil timezone)

Overview
- We added a Supabase Edge Function `send_reminders` that queries `reminders` with `status = 'pending'` whose `remind_at` falls within the next minute and POSTs the reminder (with the user's `profiles` data) to your n8n webhook.

Files added
- `supabase/functions/send_reminders/index.ts`

Environment variables (set in Supabase Functions dashboard or using `supabase` CLI)
- `SUPABASE_URL` (already available in your project)
- `SUPABASE_SERVICE_ROLE_KEY` (Service Role key from Supabase — keep secret)
- `N8N_WEBHOOK_URL` (optional; defaults to https://n88n.inoovaweb.com.br/webhook/disparar_lembrete)

Important timezone note
- The function queries `remind_at` using UTC timestamps. To guarantee reminders fire at the user's Brazil local time, ensure the client converts local Brazil datetime to UTC before saving `remind_at` in the DB. Brasilia time is typically UTC-03:00.

Deployment steps (recommended)
1. Install supabase CLI: https://supabase.com/docs/guides/cli

2. From the repo root, deploy the function:

```bash
# from project root
cd supabase/functions/send_reminders
# deploy (this requires you logged in to supabase CLI)
supabase functions deploy send_reminders --project-ref <PROJECT_REF>
```

3. Add environment variables in Supabase dashboard (Project -> Settings -> API for keys, and Functions -> Environment for function secrets). Add `SUPABASE_SERVICE_ROLE_KEY` and `N8N_WEBHOOK_URL`.

4. Schedule the function (Supabase Scheduled Functions / Cron)
- In the Supabase dashboard, go to "Functions" -> "Schedules" -> "Create a schedule"
- Use a schedule like `* * * * *` (run every minute)
- Set the timezone to `America/Sao_Paulo` (Brazil)
- Set target to the `send_reminders` function

Alternatively, using the CLI (if supported in your CLI version):
```bash
supabase functions schedule create --name "send-reminders-schedule" \
  --function send_reminders \
  --schedule "* * * * *" \
  --timezone "America/Sao_Paulo" \
  --project-ref <PROJECT_REF>
```

Testing locally
- You can run the function locally (supabase supports `supabase functions serve`):

```bash
cd supabase/functions/send_reminders
supabase functions serve
# Then call locally (example):
curl -X POST http://localhost:54321/functions/v1/send_reminders
```

- To force a reminder to be picked up when testing, set a `remind_at` equal to UTC now or within the next minute.

Security
- Use `SUPABASE_SERVICE_ROLE_KEY` only in server-side/Functions environment — never expose it to the client.

If you want, I can:
- Add server-side logging or a `reminder_logs` table to keep history of dispatch attempts.
- Add retries / backoff when webhook fails.
- Convert the function to use a timezone-aware comparison inside Postgres (if you prefer storing naive local times).

