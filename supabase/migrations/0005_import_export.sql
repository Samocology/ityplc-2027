-- Migration: 0005_import_export
-- Description: Import templates and export tracking for KingsPass preparation (Phase 8)

-- ------------------------------------------------------------
-- import_templates
-- Approved bulk import templates defined by HQ.
-- Zone admins use these templates when uploading CSV files.
-- ------------------------------------------------------------
create table import_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  headers jsonb not null default '[]',
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table import_templates is 'Approved bulk import templates created by HQ. Defines expected CSV headers.';
comment on column import_templates.headers is 'Array of expected column names for CSV import validation.';
comment on column import_templates.created_by is 'HQ admin who created the template.';

-- ------------------------------------------------------------
-- export_batches
-- Tracks each export job: actor, type, status, counts, timestamps.
-- ------------------------------------------------------------
create table export_batches (
  id uuid primary key default gen_random_uuid(),
  export_type text not null check (export_type in ('kingspass', 'registrations')),
  zone_id uuid references zones(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  total_rows integer not null default 0,
  exported_rows integer not null default 0,
  file_name text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

comment on table export_batches is 'Tracks export jobs including KingsPass (paid-only) exports.';
comment on column export_batches.export_type is 'Type of export: kingspass (paid-only) or registrations (all).';
comment on column export_batches.zone_id is 'Zone the export is scoped to (null for HQ global exports).';

-- ------------------------------------------------------------
-- export_rows
-- Per-row audit record for each row in an export batch.
-- ------------------------------------------------------------
create table export_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references export_batches(id) on delete cascade,
  row_number integer not null,
  first_name text,
  surname text,
  kingschat_username text,
  designation text,
  title text,
  age_group text,
  zone_id uuid,
  payment_status text,
  registration_source text,
  exported_at timestamptz not null default now()
);

comment on table export_rows is 'Per-row audit record for export batches.';

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index idx_import_templates_active on import_templates(is_active);
create index idx_import_templates_created_by on import_templates(created_by);
create index idx_export_batches_export_type on export_batches(export_type);
create index idx_export_batches_zone_id on export_batches(zone_id);
create index idx_export_batches_actor_id on export_batches(actor_id);
create index idx_export_batches_status on export_batches(status);
create index idx_export_batches_created_at on export_batches(created_at);
create index idx_export_rows_batch_id on export_rows(batch_id);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table import_templates enable row level security;
alter table export_batches enable row level security;
alter table export_rows enable row level security;

-- import_templates: public read active templates; HQ admins can manage.
create policy "Active import templates are publicly readable"
  on import_templates for select
  to public
  using (is_active = true);

create policy "HQ admins can manage import templates"
  on import_templates for all
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

-- export_batches: zone admins can read batches in their zone; HQ can read all.
create policy "Zone admins can read batches in their zone"
  on export_batches for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'zone_admin'
        and user_profiles.zone_id = export_batches.zone_id
    )
  );

create policy "Zone admins can create batches in their zone"
  on export_batches for insert
  to authenticated
  with check (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'zone_admin'
        and user_profiles.zone_id = export_batches.zone_id
    )
  );

create policy "HQ admins can read all export batches"
  on export_batches for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );

-- export_rows: zone admins can read rows for batches in their zone; HQ can read all.
create policy "Zone admins can read rows in their zone batches"
  on export_rows for select
  to authenticated
  using (
    exists (
      select 1 from export_batches eb
      join user_profiles up on up.id = auth.uid()
      where eb.id = export_rows.batch_id
        and up.role = 'zone_admin'
        and up.zone_id = eb.zone_id
    )
  );

create policy "HQ admins can read all export rows"
  on export_rows for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );
