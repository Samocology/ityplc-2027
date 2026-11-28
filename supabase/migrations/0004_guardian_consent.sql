-- Migration: 0004_guardian_consent
-- Description: Guardian contact and consent workflow tables (Phase 7)

-- ------------------------------------------------------------
-- guardians
-- Guardian contact details linked to a participant registration.
-- ------------------------------------------------------------
create table guardians (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  first_name text not null,
  surname text not null,
  email text not null,
  phone text,
  relationship text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table guardians is 'Guardian contact details for participant registrations.';
comment on column guardians.email is 'Guardian email address used for consent communications.';
comment on column guardians.phone is 'Guardian phone number (optional).';
comment on column guardians.relationship is 'Relationship to the participant (e.g. Parent, Guardian).';

-- ------------------------------------------------------------
-- guardian_consent_templates
-- Configurable consent requirements per zone or globally.
-- Each template defines a consent field that guardians must respond to.
-- ------------------------------------------------------------
create table guardian_consent_templates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid references zones(id) on delete set null,
  title text not null,
  description text not null,
  is_required boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table guardian_consent_templates is 'Configurable consent requirement templates. Null zone_id means global template applicable to all zones.';
comment on column guardian_consent_templates.is_required is 'Whether guardians must respond to this consent.';
comment on column guardian_consent_templates.is_active is 'Whether this consent template is currently in use.';

-- ------------------------------------------------------------
-- guardian_responses
-- Guardian responses to consent requests.
-- Tracks whether consent was given, denied, or is pending.
-- ------------------------------------------------------------
create table guardian_responses (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references guardians(id) on delete cascade,
  consent_template_id uuid not null references guardian_consent_templates(id) on delete restrict,
  response text not null check (response in ('pending', 'granted', 'denied')),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table guardian_responses is 'Guardian consent responses with status pending/granted/denied.';
comment on column guardian_responses.response is 'Consent response: pending (no response yet), granted, or denied.';
comment on column guardian_responses.responded_at is 'Timestamp when the guardian responded (null if pending).';

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index idx_guardians_registration_id on guardians(registration_id);
create index idx_guardians_email on guardians(email);
create index idx_guardian_consent_templates_zone_id on guardian_consent_templates(zone_id);
create index idx_guardian_consent_templates_active on guardian_consent_templates(is_active);
create index idx_guardian_responses_guardian_id on guardian_responses(guardian_id);
create index idx_guardian_responses_template_id on guardian_responses(consent_template_id);
create index idx_guardian_responses_response on guardian_responses(response);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table guardians enable row level security;
alter table guardian_consent_templates enable row level security;
alter table guardian_responses enable row level security;

-- guardians: public can insert (during registration).
create policy "Public can create guardians"
  on guardians for insert
  to public
  with check (true);

-- guardians: zone admins can read guardians in their own zone.
create policy "Zone admins can read guardians in their zone"
  on guardians for select
  to authenticated
  using (
    exists (
      select 1 from registrations r
      join user_profiles up on up.id = auth.uid()
      where r.id = guardians.registration_id
        and up.role = 'zone_admin'
        and up.zone_id = r.zone_id
    )
  );

-- guardians: HQ admins can read all guardians.
create policy "HQ admins can read all guardians"
  on guardians for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );

-- guardian_consent_templates: public read (for display); HQ admins can manage.
create policy "Guardian consent templates are publicly readable"
  on guardian_consent_templates for select
  to public
  using (is_active = true);

create policy "HQ admins can manage consent templates"
  on guardian_consent_templates for all
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

-- guardian_responses: zone admins can read responses in their zone.
create policy "Zone admins can read responses in their zone"
  on guardian_responses for select
  to authenticated
  using (
    exists (
      select 1 from guardians g
      join registrations r on r.id = g.registration_id
      join user_profiles up on up.id = auth.uid()
      where g.id = guardian_responses.guardian_id
        and up.role = 'zone_admin'
        and up.zone_id = r.zone_id
    )
  );

-- guardian_responses: HQ admins can read all guardian responses.
create policy "HQ admins can read all guardian responses"
  on guardian_responses for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );
