-- Migration: 0012_zone_activation_rpc_update
-- Description: Update activate_zone_admin RPC to handle pre-activation codes
--
-- When auth_user_id is null (code created before user exists), set it to
-- the caller during activation. When set, verify the caller matches.

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

  -- If auth_user_id is set, verify the caller matches.
  -- If null, this is a pre-provisioned code; bind it to the caller now.
  if code_record.auth_user_id is not null then
    if code_record.auth_user_id <> caller_uid then
      return query select false, null::uuid, 'Activation code is not authorized for this user';
    end if;
  else
    -- Bind the code to the authenticated caller
    update zone_activation_codes
    set auth_user_id = caller_uid
    where id = code_record.id;
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

  -- Set admin_email on the zone if an email was provided
  if code_record.email is not null then
    update zones
    set admin_email = code_record.email
    where id = code_record.zone_id;
  end if;

  return query select true, code_record.zone_id, null;
end;
$$;

-- Grant execute on the function to authenticated users
grant execute on function activate_zone_admin(text) to authenticated;

comment on function activate_zone_admin(text) is
  'Atomically activates a zone administrator using a single-use activation code. Binds pre-provisioned codes to the calling user, validates code expiry and single-use, prevents duplicate zone admins, and stores admin email on the zone.';
