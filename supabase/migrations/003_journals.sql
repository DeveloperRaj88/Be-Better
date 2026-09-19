create table if not exists public.journals(
 user_id uuid not null references auth.users(id) on delete cascade,
 journal_date date not null,
 achieved text not null default '',
 learned text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 primary key(user_id,journal_date)
);

alter table public.journals enable row level security;

drop policy if exists "journals own all" on public.journals;
create policy "journals own all" on public.journals for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
