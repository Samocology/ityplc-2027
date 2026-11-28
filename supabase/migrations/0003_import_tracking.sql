-- Migration: 0003_import_tracking
-- Description: Import batch and row tracking for zone bulk registration (Phase 5)

-- ------------------------------------------------------------
-- import_batches
-- Tracks each bulk import job: source, actor, zone, status, timestamps.
-- ------------------------------------------------------------
create table import_batches (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references zones(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete set null,
  source text not null check (source in ('csv_upload')),
  file_name text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  error_rows integer not null default 0,
  imported_rows integer not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

comment on table import_batches is 'Tracks bulk import jobs submitted by zone administrators.';
comment on column import_batches.source is 'Import source (csv_upload).';
comment on column import_batches.status is 'Job lifecycle: pending, completed, or failed.';
comment on column import_batches.actor_id is 'Authenticated zone account that submitted the import.';

-- ------------------------------------------------------------
-- import_rows
-- Per-row audit record for each row in an import batch.
-- Captures validation errors and import outcome per row.
-- ------------------------------------------------------------
create table import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references import_batches(id) on delete cascade,
  row_number integer not null,
  first_name text,
  surname text,
  kingschat_username text,
  designation text,
  title text,
  age_group text,
  zone_id uuid,
  payment_status text,
  registration_source text not null default 'zone_bulk_upload',
  status text not null default 'valid' check (status in ('valid', 'error', 'imported')),
  error_message text,
  created_at timestamptz not null default now()
);

comment on table import_rows is 'Per-row audit record for bulk import validation and import results.';
comment on column import_rows.status is 'Row outcome: valid, error, or imported.';
comment on column import_rows.error_message is 'Validation error text when status is error.';

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index idx_import_batches_zone_id on import_batches(zone_id);
create index idx_import_batches_actor_id on import_batches(actor_id);
create index idx_import_batches_status on import_batches(status);
create index idx_import_batches_created_at on import_batches(created_at);
create index idx_import_rows_batch_id on import_rows(batch_id);
create index idx_import_rows_status on import_rows(status);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table import_batches enable row level security;
alter table import_rows enable row level security;

-- Zone admins can read batches in their own zone; create batches for their zone.
create policy "Zone admins can read batches in their zone"
  on import_batches for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'zone_admin'
        and user_profiles.zone_id = import_batches.zone_id
    )
  );

create policy "Zone admins can create batches in their zone"
  on import_batches for insert
  to authenticated
  with check (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'zone_admin'
        and user_profiles.zone_id = import_batches.zone_id
    )
  );

create policy "HQ admins can read all batches"
  on import_batches for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );

-- Zone admins can read rows for batches in their own zone.
create policy "Zone admins can read rows in their zone batches"
  on import_rows for select
  to authenticated
  using (
    exists (
      select 1 from import_batches ib
      join user_profiles up on up.id = auth.uid()
      where ib.id = import_rows.batch_id
        and up.role = 'zone_admin'
        and up.zone_id = ib.zone_id
    )
  );

create policy "HQ admins can read all import rows"
  on import_rows for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );
