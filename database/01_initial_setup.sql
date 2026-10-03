-- Antara Properties: run ONCE in Supabase SQL Editor as postgres.
-- Transactional: an error rolls back this setup. No existing data is deleted.
-- Kept outside supabase/migrations because initial setup is manual.
begin;

create schema if not exists antara_private;
revoke all on schema antara_private from public, anon, authenticated;
grant usage on schema antara_private to authenticated;

create table antara_private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table antara_private.admin_users enable row level security;
revoke all on antara_private.admin_users from public, anon, authenticated;

create function antara_private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from antara_private.admin_users where user_id = auth.uid());
$$;
revoke all on function antara_private.is_admin() from public, anon;
grant execute on function antara_private.is_admin() to authenticated;

-- Complete master record: ONLY admins may read, including all optional details.
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('ANT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  title text,
  category text check (category in ('plot','farm','row_house','unfinished_house','flat','villa','independent_house','commercial','builder_project','other')),
  transaction_type text check (transaction_type in ('sale','rent','lease')),
  status text not null default 'draft' check (status in ('draft','published','hidden','sold','rented','archived')),
  description text,
  city text default 'Amravati', locality text, village text, address text, landmark text,
  latitude numeric check (latitude between -90 and 90),
  longitude numeric check (longitude between -180 and 180),
  map_url text,
  asking_price numeric(16,2) check (asking_price >= 0),
  rate numeric(16,2) check (rate >= 0), rate_unit text,
  negotiable boolean,
  deposit numeric(16,2) check (deposit >= 0),
  land_area numeric(16,3) check (land_area >= 0), land_area_unit text,
  carpet_area numeric(16,3) check (carpet_area >= 0), carpet_area_unit text,
  built_up_area numeric(16,3) check (built_up_area >= 0), built_up_area_unit text,
  -- Category-specific optional fields; see README for the agreed vocabulary.
  details jsonb not null default '{}' check (jsonb_typeof(details) = 'object'),
  amenities text[] not null default '{}',
  owner_name text, owner_phone text, owner_email text,
  owner_expected_price numeric(16,2) check (owner_expected_price >= 0),
  commission_notes text, internal_notes text,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','reviewing','verified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Explicit public snapshot. Never copy owner details / documents here.
-- Publishing will be implemented in a controlled backend operation later.
create table public.property_listings (
  property_id uuid primary key references public.properties(id) on delete cascade,
  reference text not null unique,
  title text not null check (length(trim(title)) > 0),
  category text not null,
  city text, locality text,
  description text,
  asking_price numeric(16,2) check (asking_price >= 0),
  rate numeric(16,2) check (rate >= 0), rate_unit text,
  display_details jsonb not null default '{}' check (jsonb_typeof(display_details) = 'object'),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  object_path text not null unique,
  position smallint not null check (position between 1 and 4),
  caption text,
  created_at timestamptz not null default now(),
  unique(property_id, position)
);

create table public.seller_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null, owner_phone text not null, owner_email text,
  category text,
  property_details jsonb not null default '{}' check (jsonb_typeof(property_details) = 'object'),
  consent_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','reviewing','approved','rejected')),
  property_id uuid references public.properties(id) on delete set null,
  internal_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.seller_submission_photos (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.seller_submissions(id) on delete cascade,
  object_path text not null unique,
  position smallint not null check (position between 1 and 4),
  unique(submission_id, position)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  property_reference text,
  name text not null, phone text not null, email text, message text,
  requirements jsonb not null default '{}' check (jsonb_typeof(requirements) = 'object'),
  source text not null default 'website', consent_at timestamptz not null,
  status text not null default 'new' check (status in ('new','contacted','site_visit','follow_up','closed','not_interested')),
  internal_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Retry queue for later email/Sheets workers. No credentials or contact data here.
create table public.delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.seller_submissions(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  destination text not null check (destination in ('email','google_sheets')),
  status text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(), last_error text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (num_nonnulls(submission_id,lead_id) = 1),
  unique(submission_id,destination), unique(lead_id,destination)
);

create function antara_private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function antara_private.touch_updated_at() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['properties','property_listings','property_photos','seller_submissions','seller_submission_photos','leads','delivery_jobs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated, service_role', t);
    execute format('create policy admin_access on public.%I for all to authenticated using ((select antara_private.is_admin())) with check ((select antara_private.is_admin()))',t);
  end loop;
  foreach t in array array['properties','property_listings','seller_submissions','leads','delivery_jobs'] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function antara_private.touch_updated_at()',t);
  end loop;
end $$;

-- Only these two tables can be read by visitors.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.property_listings, public.property_photos to anon;
create policy published_listings on public.property_listings for select to anon, authenticated using (true);
create policy published_photos on public.property_photos for select to anon, authenticated
using (exists (select 1 from public.property_listings l where l.property_id = property_photos.property_id));

-- Hiding/selling a master record removes its public snapshot immediately.
create function antara_private.withdraw_listing() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status <> 'published' then
    delete from public.property_listings where property_id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function antara_private.withdraw_listing() from public, anon, authenticated;
create trigger withdraw_listing after update of status on public.properties
for each row execute function antara_private.withdraw_listing();

create index properties_category_status on public.properties(category,status);
create index listings_category_locality on public.property_listings(category,locality);
create index submissions_status_created on public.seller_submissions(status,created_at desc);
create index leads_status_created on public.leads(status,created_at desc);
create index delivery_jobs_due on public.delivery_jobs(status,next_attempt_at);

-- Private buckets: published property photos receive a read policy below.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('property-photos','property-photos',false,5242880,array['image/jpeg','image/png','image/webp']),
 ('seller-photos','seller-photos',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy antara_admin_files on storage.objects for all to authenticated
using (bucket_id in ('property-photos','seller-photos') and (select antara_private.is_admin()))
with check (bucket_id in ('property-photos','seller-photos') and (select antara_private.is_admin()));
create policy antara_published_files on storage.objects for select to anon, authenticated
using (bucket_id = 'property-photos' and exists (
 select 1 from public.property_photos p join public.property_listings l on l.property_id = p.property_id
 where p.object_path = storage.objects.name
));

commit;

-- Expected: 7 tables, each with row_security = true.
select tablename, rowsecurity as row_security from pg_tables
where schemaname = 'public' and tablename in
('properties','property_listings','property_photos','seller_submissions','seller_submission_photos','leads','delivery_jobs')
order by tablename;
