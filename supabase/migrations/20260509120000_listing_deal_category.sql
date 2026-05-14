-- Rent vs sale + residential vs commercial (shops, etc.)
alter table public.properties
  add column if not exists deal_type text not null default 'rent',
  add column if not exists category text not null default 'residential';

alter table public.properties drop constraint if exists properties_deal_type_check;
alter table public.properties
  add constraint properties_deal_type_check
  check (deal_type in ('rent', 'sale'));

alter table public.properties drop constraint if exists properties_category_check;
alter table public.properties
  add constraint properties_category_check
  check (category in ('residential', 'commercial'));

create index if not exists properties_deal_type_idx on public.properties (deal_type);
create index if not exists properties_category_idx on public.properties (category);
