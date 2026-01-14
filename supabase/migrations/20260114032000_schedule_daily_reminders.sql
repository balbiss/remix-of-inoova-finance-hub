-- Migration: Schedule Daily Reminders via pg_cron
-- This migration enables pg_cron and pg_net, and schedules the Edge Function trigger.

-- 1. Enable extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Unschedule if exists to allow safe re-runs
select cron.unschedule('send-daily-reminders');

-- 3. Schedule the job
-- This job calls the Edge Function at 12:00 UTC (09:00 AM Brasilia Time)
-- IMPORTANT: You must replace 'YOUR_SERVICE_ROLE_KEY' with your actual key in the SQL Editor
-- if you are running this manually. For the migration, it serves as a template.

select cron.schedule(
  'send-daily-reminders',
  '0 12 * * *',
  $$
  select net.http_post(
    url := 'https://hozwrepqajqvwjjmfwzw.supabase.co/functions/v1/send-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);

-- Note: To check job status, run:
-- select * from cron.job_run_details order by start_time desc limit 10;
