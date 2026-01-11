// Supabase Edge Function: send_reminders (uses direct REST calls to avoid bundling issues)
// This function queries pending reminders whose `remind_at` is within the next 60 seconds
// and POSTs each reminder (with user profile) to the configured n8n webhook.

export default async (req: Request) => {
  console.log('Função Edge iniciou!');
  return new Response('Teste mínimo OK', { status: 200 });
};
