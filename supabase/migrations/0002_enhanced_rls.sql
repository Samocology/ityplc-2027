-- Migration: 0002_enhanced_rls
-- Description: Role-based RLS policies for authentication and zone isolation (Phase 4)
-- Replaces the broad Phase 1 policies with role-scoped access control.

-- ------------------------------------------------------------
-- zones
-- Public read (needed for registration zone dropdown).
-- HQ admin can manage all zones.
-- Zone admin can read their own zone only.
-- ------------------------------------------------------------
drop policy if exists "Zones are publicly readable" on zones;
drop policy if exists "Authenticated users can manage zones" on zones;

create policy "Zones are publicly readable"
  on zones for select
  to public
  using (true);

create policy "HQ admins can manage zones"
  on zones for all
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

create policy "Zone admins can read their own zone"
  on zones for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'zone_admin'
        and user_profiles.zone_id = zones.id
    )
  );

-- ------------------------------------------------------------
-- user_profiles
-- Users can read their own profile.
-- Users can update their own profile but cannot change their role.
-- HQ admins can read and manage all profiles.
-- Zone admins can read their own profile only.
-- Public users cannot access profiles.
-- ------------------------------------------------------------
drop policy if exists "Users can read their own profile" on user_profiles;
drop policy if exists "Users can update their own profile" on user_profiles;
drop policy if exists "Users cannot change their own role" on user_profiles;

create policy "Users can read their own profile"
  on user_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on user_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = old.role);

create policy "HQ admins can read all profiles"
  on user_profiles for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles up
      where up.id = auth.uid()
        and up.role = 'hq_admin'
    )
  );

create policy "HQ admins can manage all profiles"
  on user_profiles for all
  to authenticated
  using (
    exists (
      select 1 from user_profiles up
      where up.id = auth.uid()
        and up.role = 'hq_admin'
    )
  )
  with check (
    exists (
      select 1 from user_profiles up
      where up.id = auth.uid()
        and up.role = 'hq_admin'
    )
  );

-- ------------------------------------------------------------
-- registrations
-- Public can insert (conference registration).
-- HQ admins can read and manage all registrations.
-- Zone admins can read registrations in their own zone only.
-- No public read of registrations.
-- ------------------------------------------------------------
drop policy if exists "Public can create registrations" on registrations;
drop policy if exists "Authenticated users can read registrations in their zone" on registrations;

create policy "Public can create registrations"
  on registrations for insert
  to public
  with check (true);

create policy "HQ admins can read all registrations"
  on registrations for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );

create policy "HQ admins can manage all registrations"
  on registrations for all
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

create policy "Zone admins can read registrations in their zone"
  on registrations for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'zone_admin'
        and user_profiles.zone_id = registrations.zone_id
    )
  );

-- ------------------------------------------------------------
-- audit_logs
-- Actors can read their own entries.
-- HQ admins can read all entries.
-- Zone admins can read entries related to their zone.
-- ------------------------------------------------------------
drop policy if exists "Actors can read their own audit log entries" on audit_logs;

create policy "Actors can read their own audit log entries"
  on audit_logs for select
  to authenticated
  using (actor_id = auth.uid());

create policy "HQ admins can read all audit log entries"
  on audit_logs for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );

create policy "Zone admins can read audit log entries for their zone"
  on audit_logs for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles up
      where up.id = auth.uid()
        and up.role = 'zone_admin'
        and up.zone_id = (
          select zone_id from registrations where id = entity_id
        )
    )
  );
