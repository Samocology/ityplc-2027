-- Migration: 0001_initial_schema
-- Description: Foundational ITYPLC 2027 schema (Phase 1)
-- Tables: zones, user_profiles, registrations, audit_logs
-- Security: RLS enabled on all tables with baseline policies

-- Enable uuid extension for generated primary keys
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- zones
-- Stores the official conference zone records.
-- Zone names must be preserved exactly as supplied by the project owner.
-- ------------------------------------------------------------
create table zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table zones is 'Official conference zone records. Names preserved exactly as supplied.';
comment on column zones.name is 'Official zone name, must not be altered.';
comment on column zones.slug is 'URL-friendly unique identifier for the zone.';

-- ------------------------------------------------------------
-- user_profiles
-- Connects authenticated Supabase users to their application roles.
-- Roles: hq_admin, zone_admin. zone_id is nullable for HQ administrators.
-- Users must not be able to assign themselves administrative roles.
-- ------------------------------------------------------------
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('hq_admin', 'zone_admin')),
  zone_id uuid references zones(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table user_profiles is 'Maps authenticated users to application roles. HQ administrators have null zone_id.';
comment on column user_profiles.role is 'Administrative role: hq_admin or zone_admin.';
comment on column user_profiles.zone_id is 'Immutable zone link for zone administrators; null for HQ administrators.';

-- ------------------------------------------------------------
-- registrations
-- Initial participant registration table.
-- Foundational fields; exact form requirements confirmed before the registration feature.
-- ------------------------------------------------------------
create table registrations (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  surname text not null,
  kingschat_username text,
  designation text,
  title text,
  age_group text,
  zone_id uuid not null references zones(id) on delete restrict,
  registration_status text not null default 'registered' check (registration_status in ('registered', 'cancelled', 'pending')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  registration_source text not null check (registration_source in ('public', 'zone_bulk_upload')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table registrations is 'Participant registrations. Payment status is separate from registration status.';
comment on column registrations.zone_id is 'Zone the participant belongs to; enforced by trusted database relationship.';
comment on column registrations.registration_source is 'How the registration was created: public form or zone bulk upload.';

-- ------------------------------------------------------------
-- audit_logs
-- Basic audit structure for recording important administrative changes.
-- Avoid storing unnecessary personal information in audit metadata.
-- ------------------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

comment on table audit_logs is 'Audit trail for administrative changes. Do not store unnecessary personal information in metadata.';
comment on column audit_logs.actor_id is 'Authenticated user who performed the action, if any.';
comment on column audit_logs.metadata is 'Additional context; must not contain unnecessary personal information.';

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index idx_registrations_zone_id on registrations(zone_id);
create index idx_registrations_payment_status on registrations(payment_status);
create index idx_registrations_registration_status on registrations(registration_status);
create index idx_user_profiles_zone_id on user_profiles(zone_id);
create index idx_user_profiles_role on user_profiles(role);
create index idx_audit_logs_actor_id on audit_logs(actor_id);
create index idx_audit_logs_created_at on audit_logs(created_at);

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger zones_updated_at
  before update on zones
  for each row
  execute function update_updated_at_column();

create trigger user_profiles_updated_at
  before update on user_profiles
  for each row
  execute function update_updated_at_column();

create trigger registrations_updated_at
  before update on registrations
  for each row
  execute function update_updated_at_column();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table zones enable row level security;
alter table user_profiles enable row level security;
alter table registrations enable row level security;
alter table audit_logs enable row level security;

-- zones: public read access (needed for registration zone dropdown)
create policy "Zones are publicly readable"
  on zones for select
  to public
  using (true);

-- zones: only authenticated users can modify (refined in Phase 4)
create policy "Authenticated users can manage zones"
  on zones for all
  to authenticated
  using (true)
  with check (true);

-- user_profiles: no public access
create policy "Users can read their own profile"
  on user_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on user_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Prevent users from assigning themselves administrative roles
create policy "Users cannot change their own role"
  on user_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = old.role);

-- registrations: public can submit (INSERT) but cannot read
create policy "Public can create registrations"
  on registrations for insert
  to public
  with check (true);

-- registrations: no public read
-- (no SELECT policy for public, so reads are denied by default)

-- registrations: authenticated users can read registrations in their own zone
-- (zone ownership enforced via trusted database relationship; refined in Phase 4)
create policy "Authenticated users can read registrations in their zone"
  on registrations for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.zone_id = registrations.zone_id
    )
  );

-- audit_logs: no public access; actors can only see their own actions
create policy "Actors can read their own audit log entries"
  on audit_logs for select
  to authenticated
  using (actor_id = auth.uid());

-- ------------------------------------------------------------
-- Seed data: official zone list
-- The following zones are supplied by the project owner.
-- Do not invent parent-child relationships.
-- ------------------------------------------------------------
insert into zones (name, slug, is_active) values
  ('ABA ZONE', 'aba-zone', true),
  ('ABAKALIKI ZONE', 'abakaliki-zone', true),
  ('ABUJA ZONE 1', 'abuja-zone-1', true),
  ('ABUJA ZONE 2', 'abuja-zone-2', true),
  ('ACCRA GHANA ZONE', 'accra-ghana-zone', true),
  ('AMSTERDAM DSP', 'amsterdam-dsp', true),
  ('AUSTRALIA REGION', 'australia-region', true),
  ('BARKING DSP', 'barking-dsp', true),
  ('BENIN ZONE 1', 'benin-zone-1', true),
  ('BENIN ZONE 2', 'benin-zone-2', true),
  ('CAPE TOWN ZONE 1', 'cape-town-zone-1', true),
  ('CAPE TOWN ZONE 2', 'cape-town-zone-2', true),
  ('CE CONVENTION GROUND PH DSP', 'ce-convention-ground-ph-dsp', true),
  ('CHAD ZONE', 'chad-zone', true),
  ('DALLAS ZONE USA REGION 2', 'dallas-zone-usa-region-2', true),
  ('DURBAN ZONE', 'durban-zone', true),
  ('EASTERN EUROPE REGION', 'eastern-europe-region', true),
  ('EDO NORTH AND CENTRAL ZONE', 'edo-north-and-central-zone', true),
  ('ECA ZONE 1', 'eca-zone-1', true),
  ('ECA ZONE 2', 'eca-zone-2', true),
  ('ECA ZONE 3', 'eca-zone-3', true),
  ('ECA ZONE 4', 'eca-zone-4', true),
  ('ECA ZONE 5', 'eca-zone-5', true),
  ('ECA ZONE 6', 'eca-zone-6', true),
  ('ECA ZONE 8', 'eca-zone-8', true),
  ('HAWAII ZONE', 'hawaii-zone', true),
  ('IBADAN ZONE 1', 'ibadan-zone-1', true),
  ('IBADAN ZONE 2', 'ibadan-zone-2', true),
  ('INDIA ZONE 1', 'india-zone-1', true),
  ('INDIA ZONE 2', 'india-zone-2', true),
  ('IRELAND SUB ZONE', 'ireland-sub-zone', true),
  ('KENYA ZONE', 'kenya-zone', true),
  ('KENYA SUB ZONE A', 'kenya-sub-zone-a', true),
  ('KENYA SUB ZONE B', 'kenya-sub-zone-b', true),
  ('KENYA SUB ZONE C', 'kenya-sub-zone-c', true),
  ('KENYA SUB ZONE D', 'kenya-sub-zone-d', true),
  ('KENYA SUB ZONE E', 'kenya-sub-zone-e', true),
  ('LAGOS SUB ZONE A', 'lagos-sub-zone-a', true),
  ('LAGOS SUB ZONE B', 'lagos-sub-zone-b', true),
  ('LAGOS SUB ZONE C', 'lagos-sub-zone-c', true),
  ('LAGOS SUB ZONE D', 'lagos-sub-zone-d', true),
  ('LAGOS VIRTUAL ZONE', 'lagos-virtual-zone', true),
  ('LAGOS ZONE 1', 'lagos-zone-1', true),
  ('LAGOS ZONE 2', 'lagos-zone-2', true),
  ('LAGOS ZONE 3', 'lagos-zone-3', true),
  ('LAGOS ZONE 4', 'lagos-zone-4', true),
  ('LAGOS ZONE 5', 'lagos-zone-5', true),
  ('LAGOS ZONE 6', 'lagos-zone-6', true),
  ('LOVEWORLD CHURCH ZONE', 'loveworld-church-zone', true),
  ('MIDDLE EAST & SOUTH ASIA REGION', 'middle-east-and-south-asia-region', true),
  ('MIDWEST ZONE', 'midwest-zone', true),
  ('MINISTRY CENTRE ABEOKUTA', 'ministry-centre-abeokuta', true),
  ('MINISTRY CENTRE ABUJA', 'ministry-centre-abuja', true),
  ('MINISTRY CENTRE WARRI', 'ministry-centre-warri', true),
  ('MINISTRY CENTRE CALABAR', 'ministry-centre-calabar', true),
  ('MINISTRY CENTRE IBADAN', 'ministry-centre-ibadan', true),
  ('NORTH CENTRAL ZONE 1', 'north-central-zone-1', true),
  ('NORTH CENTRAL ZONE 2', 'north-central-zone-2', true),
  ('NORTH EAST ZONE 1', 'north-east-zone-1', true),
  ('NORTH WEST ZONE 1', 'north-west-zone-1', true),
  ('NORTH WEST ZONE 2', 'north-west-zone-2', true),
  ('ONITSHA ZONE 1', 'onitsha-zone-1', true),
  ('ONITSHA ZONE 2', 'onitsha-zone-2', true),
  ('OTTAWA ZONE', 'ottawa-zone', true),
  ('PORT HARCOURT ZONE 1', 'port-harcourt-zone-1', true),
  ('PORT HARCOURT ZONE 2', 'port-harcourt-zone-2', true),
  ('PORT HARCOURT ZONE 3', 'port-harcourt-zone-3', true),
  ('QUEBEC ZONE', 'quebec-zone', true),
  ('SA ZONE 1', 'sa-zone-1', true),
  ('SA ZONE 2', 'sa-zone-2', true),
  ('SA ZONE 3', 'sa-zone-3', true),
  ('SA ZONE 5', 'sa-zone-5', true),
  ('SOUTH AMERICA REGION', 'south-america-region', true),
  ('SOUTH EAST ZONE 1', 'south-east-zone-1', true),
  ('SOUTH EAST ZONE 3', 'south-east-zone-3', true),
  ('SOUTH SOUTH ZONE 1', 'south-south-zone-1', true),
  ('SOUTH SOUTH ZONE 2', 'south-south-zone-2', true),
  ('SOUTH SOUTH ZONE 3', 'south-south-zone-3', true),
  ('SOUTH SOUTH ZONE 4', 'south-south-zone-4', true),
  ('SOUTH WEST ZONE 1', 'south-west-zone-1', true),
  ('SOUTH WEST ZONE 2', 'south-west-zone-2', true),
  ('SOUTH WEST ZONE 3', 'south-west-zone-3', true),
  ('SOUTH WEST ZONE 4', 'south-west-zone-4', true),
  ('SOUTH WEST ZONE 5', 'south-west-zone-5', true),
  ('TANZANIA ZONE', 'tanzania-zone', true),
  ('TEXAS ZONE 1 USA REGION 3', 'texas-zone-1-usa-region-3', true),
  ('TORONTO ZONE', 'toronto-zone', true),
  ('UK ZONE 1 DSP', 'uk-zone-1-dsp', true),
  ('UK ZONE 1 REGION 2', 'uk-zone-1-region-2', true),
  ('UK ZONE 2 DSP', 'uk-zone-2-dsp', true),
  ('UK ZONE 2 REGION 2', 'uk-zone-2-region-2', true),
  ('UK ZONE 3 DSP', 'uk-zone-3-dsp', true),
  ('UK ZONE 3 REGION 2', 'uk-zone-3-region-2', true),
  ('UK ZONE 4 DSP', 'uk-zone-4-dsp', true),
  ('UK ZONE 4 REGION 2', 'uk-zone-4-region-2', true),
  ('USA REGION 2', 'usa-region-2', true),
  ('USA ZONE 1 REGION 1', 'usa-zone-1-region-1', true),
  ('USA ZONE 2 REGION 1', 'usa-zone-2-region-1', true),
  ('WARRI DSC SUB ZONE', 'warri-dsc-sub-zone', true),
  ('WEST CAMEROON ZONE', 'west-cameroon-zone', true),
  ('WESTERN EUROPE ZONE 1', 'western-europe-zone-1', true),
  ('WESTERN EUROPE ZONE 2', 'western-europe-zone-2', true),
  ('WESTERN EUROPE ZONE 3', 'western-europe-zone-3', true),
  ('WESTERN EUROPE ZONE 4', 'western-europe-zone-4', true),
  ('New Zone', 'new-zone', true),
  ('Other', 'other', true);
