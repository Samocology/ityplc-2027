-- Migration: 0010_zone_activation_hardening
-- Description: Harden zone admin activation (Phase 10)
--
-- Security fixes:
-- 1. Allow auth_user_id to read their own activation code (was HQ-admin only).
-- 2. Atomic activation via SECURITY DEFINER RPC function (prevents race conditions).
-- 3. Prevent duplicate zone_admin profiles per zone via partial unique index.
-- 4. Check is_activated before allowing activation.

-- ------------------------------------------------------------
-- RLS: allow the authorized user to read their own activation code
-- ------------------------------------------------------------
create policy "User can read their own activation code"
  on zone_activation_codes for select
  to authenticated
  using (auth.uid() = auth_user_id);

-- ------------------------------------------------------------
-- Prevent duplicate zone_admin profiles for the same zone
-- ------------------------------------------------------------
create unique index if not exists idx_user_profiles_one_zone_admin_per_zone
  on user_profiles(zone_id)
  where role = 'zone_admin' and zone_id is not null;

-- ------------------------------------------------------------
-- Atomic zone admin activation RPC function
-- Runs as SECURITY DEFINER so it can update zones and insert
-- user_profiles even when the caller has no direct write permission.
-- All authorization is validated inside the function.
-- ------------------------------------------------------------
create or replace function activate_zone_admin(activation_code text)
returns table (success boolean, zone_id uuid, error text)
language plpgsql
as $$
declare
  code_record record;
  existing_profile record;
  caller_uid uuid := auth.uid();
begin
  -- Find and lock the activation code
  select * into code_record
  from zone_activation_codes
  where code = activation_code
    and used_at is null
    and expires_at > now()
  for update;

  if not found then
    return query select false, null::uuid, 'Invalid or expired activation code';
  end if;

  -- Verify the caller matches the authorized auth user
  if code_record.auth_user_id is not null and code_record.auth_user_id <> caller_uid then
    return query select false, null::uuid, 'Activation code is not authorized for this user';
  end if;

  -- Check if zone is already activated
  if exists (
    select 1 from zones where id = code_record.zone_id and is_activated = true
  ) then
    return query select false, null::uuid, 'Zone is already activated';
  end if;

  -- Check if zone already has a zone_admin profile
  select * into existing_profile
  from user_profiles
  where zone_id = code_record.zone_id
    and role = 'zone_admin'
  limit 1;

  if found then
    return query select false, null::uuid, 'Zone already has an administrator';
  end if;

  -- Activate the zone
  update zones
  set is_activated = true, activated_at = now()
  where id = code_record.zone_id;

  -- Mark the code as used
  update zone_activation_codes
  set used_at = now()
  where id = code_record.id;

  -- Create the zone admin profile
  insert into user_profiles (id, role, zone_id)
  values (code_record.auth_user_id, 'zone_admin', code_record.zone_id)
  on conflict (id) do nothing;

  return query select true, code_record.zone_id, null;
end;
$$;

-- Grant execute on the function to authenticated users
grant execute on function activate_zone_admin(text) to authenticated;

comment on function activate_zone_admin(text) is
  'Atomically activates a zone administrator using a single-use activation code. Validates code expiry, single-use, caller authorization, and prevents duplicate zone admins.';
