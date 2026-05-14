-- App uses auth.users id as owner_id (not legacy public.users).
alter table public.properties drop constraint if exists properties_owner_id_fkey;

alter table public.properties
  add constraint properties_owner_id_fkey
  foreign key (owner_id) references auth.users (id) on delete cascade;
