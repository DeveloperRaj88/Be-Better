create extension if not exists pgcrypto;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 name text,
 email text,
 whatsapp text,
 report_frequency text not null default 'both' check(report_frequency in ('none','weekly','monthly','both')),
 delivery_method text not null default 'email' check(delivery_method in ('email','whatsapp','both')),
 timezone text not null default 'Asia/Kolkata',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.tasks(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(trim(title))>0),
 description text,
 category text not null default 'Personal',
 priority text not null default 'Medium',
 due_date date not null default current_date,
 completed boolean not null default false,
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists tasks_user_date_idx on public.tasks(user_id,due_date);
create index if not exists tasks_user_completed_idx on public.tasks(user_id,completed);

create table if not exists public.daily_quotes(
 quote_date date primary key,
 quote text not null,
 author text not null default 'Unknown',
 created_at timestamptz not null default now()
);

create table if not exists public.daily_celebrations(
 user_id uuid not null references auth.users(id) on delete cascade,
 celebration_date date not null,
 shown_at timestamptz not null default now(),
 primary key(user_id,celebration_date)
);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_quotes enable row level security;
alter table public.daily_celebrations enable row level security;

drop policy if exists "profiles own select" on public.profiles;
create policy "profiles own select" on public.profiles for select using(auth.uid()=id);
drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert" on public.profiles for insert with check(auth.uid()=id);
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id);

drop policy if exists "tasks own all" on public.tasks;
create policy "tasks own all" on public.tasks for all using(auth.uid()=user_id) with check(auth.uid()=user_id);

drop policy if exists "quotes public read" on public.daily_quotes;
create policy "quotes public read" on public.daily_quotes for select using(true);
drop policy if exists "quotes authenticated insert" on public.daily_quotes;
create policy "quotes authenticated insert" on public.daily_quotes for insert with check(auth.role()='authenticated');

drop policy if exists "celebrations own all" on public.daily_celebrations;
create policy "celebrations own all" on public.daily_celebrations for all using(auth.uid()=user_id) with check(auth.uid()=user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,email,name) values(new.id,new.email,new.raw_user_meta_data->>'name');
 return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
