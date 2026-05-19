-- AI poster generation limits and property poster URL
alter table public.properties
  add column if not exists generated_poster_url text,
  add column if not exists ai_description text,
  add column if not exists floor text,
  add column if not exists balcony text,
  add column if not exists parking text,
  add column if not exists last_poster_style_id text,
  add column if not exists last_poster_layout_id text;

alter table public.profiles
  add column if not exists poster_generation_count int not null default 0,
  add column if not exists subscription_status text not null default 'free',
  add column if not exists subscription_plan text,
  add column if not exists subscription_expiry timestamptz;

comment on column public.properties.generated_poster_url is 'Latest AI marketing poster in storage';
comment on column public.properties.ai_description is 'Last AI-generated description draft';
comment on column public.profiles.poster_generation_count is 'Free-tier poster generations used';
