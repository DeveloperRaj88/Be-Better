create table if not exists public.login_days(
 user_id uuid not null references auth.users(id) on delete cascade,
 login_date date not null,
 created_at timestamptz not null default now(),
 primary key(user_id,login_date)
);

alter table public.login_days enable row level security;

drop policy if exists "login days own all" on public.login_days;
create policy "login days own all" on public.login_days for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
