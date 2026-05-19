alter table public.properties
  add column if not exists last_poster_style_id text,
  add column if not exists last_poster_layout_id text;
