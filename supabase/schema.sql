-- Matches the app: properties + property_images, owner references auth.users(id).
-- Enable uuid-ossp if you use uuid_generate_v4:
-- create extension if not exists "uuid-ossp";

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  price integer not null,
  property_type text not null,
  location text,
  address text,
  area_sqft integer,
  map_link text,
  bedrooms integer,
  bathrooms integer,
  furnishing text,
  available_status text default 'available',
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  image_url text not null
);

create index if not exists properties_expires_at_idx on public.properties (expires_at);
create index if not exists properties_owner_id_idx on public.properties (owner_id);
create index if not exists property_images_property_id_idx on public.property_images (property_id);

-- RLS: see migrations (properties_select_public, properties_insert_owner, etc.).
