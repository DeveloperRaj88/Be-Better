create table if not exists public.rest_days(
 user_id uuid not null references auth.users(id) on delete cascade,
 rest_date date not null,
 created_at timestamptz not null default now(),
 primary key(user_id,rest_date)
);

alter table public.rest_days enable row level security;

drop policy if exists "rest days own all" on public.rest_days;
create policy "rest days own all" on public.rest_days for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
