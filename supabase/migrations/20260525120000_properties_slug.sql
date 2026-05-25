-- SEO-friendly unique slug per listing (e.g. 1bhk-govind-nagar-mumbai)

alter table public.properties
  add column if not exists slug text;

-- Backfill from type + title + location; append -2, -3 for duplicates
with base as (
  select
    id,
    trim(both '-' from regexp_replace(
      lower(
        concat_ws(
          '-',
          nullif(trim(property_type), ''),
          nullif(trim(title), ''),
          nullif(trim(location), '')
        )
      ),
      '[^a-z0-9]+',
      '-',
      'g'
    )) as raw_slug,
    created_at
  from public.properties
  where slug is null
),
cleaned as (
  select
    id,
    case
      when raw_slug = '' or raw_slug is null then 'property-' || left(replace(id::text, '-', ''), 8)
      else left(raw_slug, 80)
    end as base_slug,
    created_at
  from base
),
numbered as (
  select
    id,
    base_slug,
    row_number() over (partition by base_slug order by created_at asc, id asc) as rn
  from cleaned
)
update public.properties p
set slug = case
  when n.rn = 1 then n.base_slug
  else n.base_slug || '-' || n.rn::text
end
from numbered n
where p.id = n.id and p.slug is null;

alter table public.properties
  alter column slug set not null;

create unique index if not exists properties_slug_key on public.properties (slug);

comment on column public.properties.slug is 'Stable URL segment for /property/[slug]';
