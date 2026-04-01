-- Per-user saved listings (favorites).
create table if not exists public.property_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create index if not exists property_favorites_property_id_idx on public.property_favorites (property_id);
create index if not exists property_favorites_user_id_idx on public.property_favorites (user_id);

alter table public.property_favorites enable row level security;

drop policy if exists "property_favorites_select_own" on public.property_favorites;
create policy "property_favorites_select_own"
  on public.property_favorites for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "property_favorites_insert_own" on public.property_favorites;
create policy "property_favorites_insert_own"
  on public.property_favorites for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "property_favorites_delete_own" on public.property_favorites;
create policy "property_favorites_delete_own"
  on public.property_favorites for delete
  to authenticated
  using (user_id = auth.uid());
