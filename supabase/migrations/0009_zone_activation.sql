-- Migration: 0009_zone_activation
-- Description: Zone ID codes and first-time zone admin activation (Phase 10)
--
-- Adds a human-readable Zone ID (max 8 characters) to every zone, plus
-- activation tracking for first-time zone admin self-service setup.
-- Does not replace the existing UUID primary key.

-- ------------------------------------------------------------
-- zones: add zone_id_code and activation fields
-- ------------------------------------------------------------
alter table zones
  add column if not exists zone_id_code text unique,
  add column if not exists is_activated boolean not null default false,
  add column if not exists activation_token text unique,
  add column if not exists activated_at timestamptz;

comment on column zones.zone_id_code is
  'Human-readable zone identifier (max 8 characters), e.g. ITY-Z001.';
comment on column zones.is_activated is
  'Whether a zone admin account has been activated for this zone.';
comment on column zones.activation_token is
  'Single-use secure token for first-time zone admin activation.';
comment on column zones.activated_at is
  'Timestamp when the zone admin account was first activated.';

create index if not exists idx_zones_zone_id_code on zones(zone_id_code);
create index if not exists idx_zones_is_activated on zones(is_activated);
create index if not exists idx_zones_activation_token on zones(activation_token);

-- ------------------------------------------------------------
-- zone_activation_codes: track issued activation authorizations
-- ------------------------------------------------------------
create table if not exists zone_activation_codes (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references zones(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table zone_activation_codes is
  'Tracks single-use activation authorizations for first-time zone admin setup.';
comment on column zone_activation_codes.code is
  'Secure, single-use authorization code for zone activation.';
comment on column zone_activation_codes.auth_user_id is
  'Supabase Auth user ID authorized to activate the zone.';
comment on column zone_activation_codes.expires_at is
  'Timestamp when this activation code expires.';

create index if not exists idx_zone_activation_codes_zone_id on zone_activation_codes(zone_id);
create index if not exists idx_zone_activation_codes_code on zone_activation_codes(code);
create index if not exists idx_zone_activation_codes_auth_user_id on zone_activation_codes(auth_user_id);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table zone_activation_codes enable row level security;

-- Zone activation codes: only HQ admins can read/manage; public cannot access.
create policy "HQ admins can read all activation codes"
  on zone_activation_codes for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );

create policy "HQ admins can manage activation codes"
  on zone_activation_codes for all
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  )
  with check (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );

-- ------------------------------------------------------------
-- Populate zone_id_code for all existing zones (systematic, max 8 chars)
-- ------------------------------------------------------------
-- Zone IDs are generated as ITY-ZNNN where NNN is a zero-padded sequence.
-- All existing zones receive a code; future zones get one via the trigger below.

update zones set zone_id_code = 'ITY-Z001' where name = 'ABA ZONE';
update zones set zone_id_code = 'ITY-Z002' where name = 'ABAKALIKI ZONE';
update zones set zone_id_code = 'ITY-Z003' where name = 'ABUJA ZONE 1';
update zones set zone_id_code = 'ITY-Z004' where name = 'ABUJA ZONE 2';
update zones set zone_id_code = 'ITY-Z005' where name = 'ACCRA GHANA ZONE';
update zones set zone_id_code = 'ITY-Z006' where name = 'AMSTERDAM DSP';
update zones set zone_id_code = 'ITY-Z007' where name = 'AUSTRALIA REGION';
update zones set zone_id_code = 'ITY-Z008' where name = 'BARKING DSP';
update zones set zone_id_code = 'ITY-Z009' where name = 'BENIN ZONE 1';
update zones set zone_id_code = 'ITY-Z010' where name = 'BENIN ZONE 2';
update zones set zone_id_code = 'ITY-Z011' where name = 'CAPE TOWN ZONE 1';
update zones set zone_id_code = 'ITY-Z012' where name = 'CAPE TOWN ZONE 2';
update zones set zone_id_code = 'ITY-Z013' where name = 'CE CONVENTION GROUND PH DSP';
update zones set zone_id_code = 'ITY-Z014' where name = 'CHAD ZONE';
update zones set zone_id_code = 'ITY-Z015' where name = 'DALLAS ZONE USA REGION 2';
update zones set zone_id_code = 'ITY-Z016' where name = 'DURBAN ZONE';
update zones set zone_id_code = 'ITY-Z017' where name = 'EASTERN EUROPE REGION';
update zones set zone_id_code = 'ITY-Z018' where name = 'EDO NORTH AND CENTRAL ZONE';
update zones set zone_id_code = 'ITY-Z019' where name = 'ECA ZONE 1';
update zones set zone_id_code = 'ITY-Z020' where name = 'ECA ZONE 2';
update zones set zone_id_code = 'ITY-Z021' where name = 'ECA ZONE 3';
update zones set zone_id_code = 'ITY-Z022' where name = 'ECA ZONE 4';
update zones set zone_id_code = 'ITY-Z023' where name = 'ECA ZONE 5';
update zones set zone_id_code = 'ITY-Z024' where name = 'ECA ZONE 6';
update zones set zone_id_code = 'ITY-Z025' where name = 'ECA ZONE 8';
update zones set zone_id_code = 'ITY-Z026' where name = 'HAWAII ZONE';
update zones set zone_id_code = 'ITY-Z027' where name = 'IBADAN ZONE 1';
update zones set zone_id_code = 'ITY-Z028' where name = 'IBADAN ZONE 2';
update zones set zone_id_code = 'ITY-Z029' where name = 'INDIA ZONE 1';
update zones set zone_id_code = 'ITY-Z030' where name = 'INDIA ZONE 2';
update zones set zone_id_code = 'ITY-Z031' where name = 'IRELAND SUB ZONE';
update zones set zone_id_code = 'ITY-Z032' where name = 'KENYA ZONE';
update zones set zone_id_code = 'ITY-Z033' where name = 'KENYA SUB ZONE A';
update zones set zone_id_code = 'ITY-Z034' where name = 'KENYA SUB ZONE B';
update zones set zone_id_code = 'ITY-Z035' where name = 'KENYA SUB ZONE C';
update zones set zone_id_code = 'ITY-Z036' where name = 'KENYA SUB ZONE D';
update zones set zone_id_code = 'ITY-Z037' where name = 'KENYA SUB ZONE E';
update zones set zone_id_code = 'ITY-Z038' where name = 'LAGOS SUB ZONE A';
update zones set zone_id_code = 'ITY-Z039' where name = 'LAGOS SUB ZONE B';
update zones set zone_id_code = 'ITY-Z040' where name = 'LAGOS SUB ZONE C';
update zones set zone_id_code = 'ITY-Z041' where name = 'LAGOS SUB ZONE D';
update zones set zone_id_code = 'ITY-Z042' where name = 'LAGOS VIRTUAL ZONE';
update zones set zone_id_code = 'ITY-Z043' where name = 'LAGOS ZONE 1';
update zones set zone_id_code = 'ITY-Z044' where name = 'LAGOS ZONE 2';
update zones set zone_id_code = 'ITY-Z045' where name = 'LAGOS ZONE 3';
update zones set zone_id_code = 'ITY-Z046' where name = 'LAGOS ZONE 4';
update zones set zone_id_code = 'ITY-Z047' where name = 'LAGOS ZONE 5';
update zones set zone_id_code = 'ITY-Z048' where name = 'LAGOS ZONE 6';
update zones set zone_id_code = 'ITY-Z049' where name = 'LOVEWORLD CHURCH ZONE';
update zones set zone_id_code = 'ITY-Z050' where name = 'MIDDLE EAST & SOUTH ASIA REGION';
update zones set zone_id_code = 'ITY-Z051' where name = 'MIDWEST ZONE';
update zones set zone_id_code = 'ITY-Z052' where name = 'MINISTRY CENTRE ABEOKUTA';
update zones set zone_id_code = 'ITY-Z053' where name = 'MINISTRY CENTRE ABUJA';
update zones set zone_id_code = 'ITY-Z054' where name = 'MINISTRY CENTRE WARRI';
update zones set zone_id_code = 'ITY-Z055' where name = 'MINISTRY CENTRE CALABAR';
update zones set zone_id_code = 'ITY-Z056' where name = 'MINISTRY CENTRE IBADAN';
update zones set zone_id_code = 'ITY-Z057' where name = 'NORTH CENTRAL ZONE 1';
update zones set zone_id_code = 'ITY-Z058' where name = 'NORTH CENTRAL ZONE 2';
update zones set zone_id_code = 'ITY-Z059' where name = 'NORTH EAST ZONE 1';
update zones set zone_id_code = 'ITY-Z060' where name = 'NORTH WEST ZONE 1';
update zones set zone_id_code = 'ITY-Z061' where name = 'NORTH WEST ZONE 2';
update zones set zone_id_code = 'ITY-Z062' where name = 'ONITSHA ZONE 1';
update zones set zone_id_code = 'ITY-Z063' where name = 'ONITSHA ZONE 2';
update zones set zone_id_code = 'ITY-Z064' where name = 'OTTAWA ZONE';
update zones set zone_id_code = 'ITY-Z065' where name = 'PORT HARCOURT ZONE 1';
update zones set zone_id_code = 'ITY-Z066' where name = 'PORT HARCOURT ZONE 2';
update zones set zone_id_code = 'ITY-Z067' where name = 'PORT HARCOURT ZONE 3';
update zones set zone_id_code = 'ITY-Z068' where name = 'QUEBEC ZONE';
update zones set zone_id_code = 'ITY-Z069' where name = 'SA ZONE 1';
update zones set zone_id_code = 'ITY-Z070' where name = 'SA ZONE 2';
update zones set zone_id_code = 'ITY-Z071' where name = 'SA ZONE 3';
update zones set zone_id_code = 'ITY-Z072' where name = 'SA ZONE 5';
update zones set zone_id_code = 'ITY-Z073' where name = 'SOUTH AMERICA REGION';
update zones set zone_id_code = 'ITY-Z074' where name = 'SOUTH EAST ZONE 1';
update zones set zone_id_code = 'ITY-Z075' where name = 'SOUTH EAST ZONE 3';
update zones set zone_id_code = 'ITY-Z076' where name = 'SOUTH SOUTH ZONE 1';
update zones set zone_id_code = 'ITY-Z077' where name = 'SOUTH SOUTH ZONE 2';
update zones set zone_id_code = 'ITY-Z078' where name = 'SOUTH SOUTH ZONE 3';
update zones set zone_id_code = 'ITY-Z079' where name = 'SOUTH SOUTH ZONE 4';
update zones set zone_id_code = 'ITY-Z080' where name = 'SOUTH WEST ZONE 1';
update zones set zone_id_code = 'ITY-Z081' where name = 'SOUTH WEST ZONE 2';
update zones set zone_id_code = 'ITY-Z082' where name = 'SOUTH WEST ZONE 3';
update zones set zone_id_code = 'ITY-Z083' where name = 'SOUTH WEST ZONE 4';
update zones set zone_id_code = 'ITY-Z084' where name = 'SOUTH WEST ZONE 5';
update zones set zone_id_code = 'ITY-Z085' where name = 'TANZANIA ZONE';
update zones set zone_id_code = 'ITY-Z086' where name = 'TEXAS ZONE 1 USA REGION 3';
update zones set zone_id_code = 'ITY-Z087' where name = 'TORONTO ZONE';
update zones set zone_id_code = 'ITY-Z088' where name = 'UK ZONE 1 DSP';
update zones set zone_id_code = 'ITY-Z089' where name = 'UK ZONE 1 REGION 2';
update zones set zone_id_code = 'ITY-Z090' where name = 'UK ZONE 2 DSP';
update zones set zone_id_code = 'ITY-Z091' where name = 'UK ZONE 2 REGION 2';
update zones set zone_id_code = 'ITY-Z092' where name = 'UK ZONE 3 DSP';
update zones set zone_id_code = 'ITY-Z093' where name = 'UK ZONE 3 REGION 2';
update zones set zone_id_code = 'ITY-Z094' where name = 'UK ZONE 4 DSP';
update zones set zone_id_code = 'ITY-Z095' where name = 'UK ZONE 4 REGION 2';
update zones set zone_id_code = 'ITY-Z096' where name = 'USA REGION 2';
update zones set zone_id_code = 'ITY-Z097' where name = 'USA ZONE 1 REGION 1';
update zones set zone_id_code = 'ITY-Z098' where name = 'USA ZONE 2 REGION 1';
update zones set zone_id_code = 'ITY-Z099' where name = 'WARRI DSC SUB ZONE';
update zones set zone_id_code = 'ITY-Z100' where name = 'WEST CAMEROON ZONE';
update zones set zone_id_code = 'ITY-Z101' where name = 'WESTERN EUROPE ZONE 1';
update zones set zone_id_code = 'ITY-Z102' where name = 'WESTERN EUROPE ZONE 2';
update zones set zone_id_code = 'ITY-Z103' where name = 'WESTERN EUROPE ZONE 3';
update zones set zone_id_code = 'ITY-Z104' where name = 'WESTERN EUROPE ZONE 4';
update zones set zone_id_code = 'ITY-Z105' where name = 'New Zone';
update zones set zone_id_code = 'ITY-Z106' where name = 'Other';

-- ------------------------------------------------------------
-- Trigger: auto-assign zone_id_code for future zones
-- ------------------------------------------------------------
create or replace function assign_zone_id_code()
returns trigger as $$
declare
  next_num integer;
  new_code text;
begin
  if new.zone_id_code is null then
    select coalesce(max(substring(zone_id_code from '[0-9]+')::int), 0) + 1
      into next_num
      from zones
      where zone_id_code like 'ITY-Z%';

    new_code := 'ITY-Z' || lpad(next_num::text, 3, '0');

    -- Ensure uniqueness (max 8 chars: ITY-ZNNN where NNN maxes at 999 = 7 chars)
    while exists (select 1 from zones where zone_id_code = new_code) loop
      next_num := next_num + 1;
      new_code := 'ITY-Z' || lpad(next_num::text, 3, '0');
    end loop;

    new.zone_id_code := new_code;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger zones_assign_zone_id_code
  before insert on zones
  for each row
  execute function assign_zone_id_code();

-- ------------------------------------------------------------
-- Constraint: zone_id_code max 8 characters
-- ------------------------------------------------------------
alter table zones
  add constraint zones_zone_id_code_max_length
  check (char_length(zone_id_code) <= 8);
