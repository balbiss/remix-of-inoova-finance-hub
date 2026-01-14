-- Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    borrower_name TEXT NOT NULL,
    borrower_phone TEXT NOT NULL,
    principal_amount NUMERIC NOT NULL,
    interest_rate NUMERIC NOT NULL, -- Percentage (e.g., 10 for 10%)
    frequency TEXT NOT NULL CHECK (frequency IN ('diario', 'semanal', 'quinzenal', 'mensal')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid', 'defaulted')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for loans
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loans"
    ON public.loans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans"
    ON public.loans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans"
    ON public.loans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans"
    ON public.loans FOR DELETE
    USING (auth.uid() = user_id);


-- Create loan_payments table
CREATE TABLE IF NOT EXISTS public.loan_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for loan_payments
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their loans"
    ON public.loan_payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.loans
        WHERE loans.id = loan_payments.loan_id
        AND loans.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert payments for their loans"
    ON public.loan_payments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.loans
        WHERE loans.id = loan_id
        AND loans.user_id = auth.uid()
    ));

CREATE POLICY "Users can update payments for their loans"
    ON public.loan_payments FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.loans
        WHERE loans.id = loan_id
        AND loans.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete payments for their loans"
    ON public.loan_payments FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.loans
        WHERE loans.id = loan_id
        AND loans.user_id = auth.uid()
    ));
