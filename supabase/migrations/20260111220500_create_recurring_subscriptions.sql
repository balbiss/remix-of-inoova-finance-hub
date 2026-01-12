-- Create a table for recurring subscriptions
CREATE TABLE IF NOT EXISTS public.recurring_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'BRL',
    billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
    next_billing_date DATE NOT NULL,
    category TEXT,
    icon TEXT,
    status TEXT DEFAULT 'active', -- active, paused, cancelled
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscriptions" 
    ON public.recurring_subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
    ON public.recurring_subscriptions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
    ON public.recurring_subscriptions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" 
    ON public.recurring_subscriptions FOR DELETE 
    USING (auth.uid() = user_id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_recurring_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recurring_subscriptions_updated_at
    BEFORE UPDATE ON public.recurring_subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE update_recurring_subscriptions_updated_at();
