-- Adicionar colunas do Stripe na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Comentário para documentação
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'ID da assinatura ativa no Stripe';
COMMENT ON COLUMN public.profiles.stripe_price_id IS 'ID do plano/preço assinado no Stripe';
