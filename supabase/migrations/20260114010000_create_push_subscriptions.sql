-- Create table for storing push subscriptions
create table public.push_subscriptions (
    id uuid not null default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    endpoint text not null,
    p256dh text not null,
    auth text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Policies
create policy "Users can view their own subscriptions"
    on public.push_subscriptions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
    on public.push_subscriptions for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
    on public.push_subscriptions for delete
    using (auth.uid() = user_id);
