-- Migration: 0008_seed_hq_admin
-- Description: HQ admin seed account and bootstrap (Phase 9)
--
-- Provides two mechanisms for creating the initial HQ administrator:
--
-- 1. Bootstrap RLS policy (active): allows the first authenticated user to
--    insert their own user_profiles row as hq_admin when no hq_admin exists.
--    Used by the /setup page.
--
-- 2. Manual seed template (commented): operator-run SQL in the Supabase
--    SQL editor for environments where the bootstrap page is not used.

-- ------------------------------------------------------------
-- Bootstrap: allow first HQ admin to self-provision
-- ------------------------------------------------------------
-- When no hq_admin exists, any authenticated user may insert their own
-- profile with role = 'hq_admin'. This enables the /setup bootstrap page.
-- Once an hq_admin exists, this policy no longer applies (the exists()
-- check fails).
create policy "Bootstrap first HQ admin when none exists"
  on user_profiles for insert
  to authenticated
  with check (
    auth.uid() = id
    and role = 'hq_admin'
    and not exists (
      select 1 from user_profiles where role = 'hq_admin'
    )
  );

-- ------------------------------------------------------------
-- Manual seed template (commented out by default)
-- ------------------------------------------------------------
-- Alternative: create the auth user via Supabase Auth, then uncomment and
-- run the INSERT below with the actual auth.users.id.
--
-- insert into user_profiles (id, role, zone_id)
-- values ('<auth-user-id>', 'hq_admin', null)
-- on conflict (id) do nothing;
