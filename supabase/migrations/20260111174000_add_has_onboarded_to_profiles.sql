-- Add has_onboarded flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_onboarded BOOLEAN DEFAULT FALSE;
