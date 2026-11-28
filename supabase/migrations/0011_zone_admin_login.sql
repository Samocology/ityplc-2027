-- Migration: 0011_zone_admin_login
-- Description: Add admin email mapping for Zone Admin login (Phase 10)
--
-- Adds admin_email to zones so Zone Admin login can map Zone ID → email
-- for Supabase Auth sign-in. Adds email to zone_activation_codes so HQ
-- admins can pre-provision activation codes with an email address.
-- Makes auth_user_id nullable so activation codes can be created before
-- the Supabase Auth user exists.

-- ------------------------------------------------------------
-- zones: add admin_email for Zone ID → email lookup
-- ------------------------------------------------------------
alter table zones
  add column if not exists admin_email text;

comment on column zones.admin_email is
  'Email address of the zone administrator, set during first-time activation.';

create index if not exists idx_zones_admin_email on zones(admin_email);

-- ------------------------------------------------------------
-- zone_activation_codes: add email, make auth_user_id nullable
-- ------------------------------------------------------------
alter table zone_activation_codes
  add column if not exists email text;

comment on column zone_activation_codes.email is
  'Email address to use for the zone administrator account during first-time activation.';

alter table zone_activation_codes
  alter column auth_user_id drop not null;

create index if not exists idx_zone_activation_codes_email on zone_activation_codes(email);
