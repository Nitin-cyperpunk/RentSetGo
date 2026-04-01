-- Role-based signup without DB triggers.
-- Profiles are created directly in server action after auth signup.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  role text not null default 'user',
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists phone text;

create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- Remove trigger-based profile creation.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Self-service profile policies.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

