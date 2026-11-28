-- Migration: 0006_notifications
-- Description: Notification tables for registration emails, guardian notifications, retry handling (Phase 9)

-- ------------------------------------------------------------
-- notification_templates
-- Configurable notification templates (email, SMS, KingsChat).
-- HQ defines templates used for registration confirmations,
-- guardian consent requests, and other automated communications.
-- ------------------------------------------------------------
create table notification_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null check (channel in ('email', 'sms', 'kingschat')),
  subject text,
  body text not null,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table notification_templates is 'Configurable notification templates for automated communications.';
comment on column notification_templates.channel is 'Delivery channel: email, sms, or kingschat.';
comment on column notification_templates.subject is 'Email subject line (null for SMS/KingsChat).';
comment on column notification_templates.body is 'Message body with placeholder variables (e.g. {{first_name}}).';

-- ------------------------------------------------------------
-- notifications
-- Queued notifications awaiting delivery.
-- Each record represents one notification to one recipient.
-- ------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references notification_templates(id) on delete set null,
  recipient_type text not null check (recipient_type in ('participant', 'guardian', 'admin')),
  recipient_id text not null,
  recipient_email text,
  recipient_phone text,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled')),
  retry_count integer not null default 0,
  max_retries integer not null default 3,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table notifications is 'Queued notifications awaiting delivery with retry support.';
comment on column notifications.recipient_type is 'Type of recipient: participant, guardian, or admin.';
comment on column notifications.recipient_id is 'Identifier of the recipient (registration_id, guardian_id, or user id).';
comment on column notifications.retry_count is 'Number of delivery attempts made so far.';
comment on column notifications.max_retries is 'Maximum delivery attempts before giving up.';
comment on column notifications.last_error is 'Error message from the last failed delivery attempt.';

-- ------------------------------------------------------------
-- notification_logs
-- Audit log of notification delivery attempts.
-- Records each attempt (sent or failed) for troubleshooting.
-- ------------------------------------------------------------
create table notification_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references notifications(id) on delete cascade,
  attempt_number integer not null,
  status text not null check (status in ('sent', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

comment on table notification_logs is 'Audit trail of notification delivery attempts.';
comment on column notification_logs.attempt_number is 'Sequential attempt number for the notification.';
comment on column notification_logs.status is 'Result of this attempt: sent or failed.';

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index idx_notification_templates_channel on notification_templates(channel);
create index idx_notification_templates_active on notification_templates(is_active);
create index idx_notifications_status on notifications(status);
create index idx_notifications_recipient on notifications(recipient_type, recipient_id);
create index idx_notifications_retry on notifications(status, retry_count);
create index idx_notification_logs_notification_id on notification_logs(notification_id);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table notification_templates enable row level security;
alter table notifications enable row level security;
alter table notification_logs enable row level security;

-- notification_templates: public read active templates; HQ admins can manage.
create policy "Active notification templates are publicly readable"
  on notification_templates for select
  to public
  using (is_active = true);

create policy "HQ admins can manage notification templates"
  on notification_templates for all
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

-- notifications: zone admins can read notifications for their zone's participants/guardians.
-- HQ admins can read all notifications.
create policy "Zone admins can read notifications in their zone"
  on notifications for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles up
      where up.id = auth.uid()
        and up.role = 'zone_admin'
        and (
          (recipient_type = 'participant' and exists (
            select 1 from registrations r
            where r.id = recipient_id::uuid and r.zone_id = up.zone_id
          ))
          or
          (recipient_type = 'guardian' and exists (
            select 1 from guardians g
            join registrations r on r.id = g.registration_id
            where g.id = recipient_id::uuid and r.zone_id = up.zone_id
          ))
        )
    )
  );

create policy "HQ admins can read all notifications"
  on notifications for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );

-- notification_logs: zone admins can read logs for their zone's notifications; HQ can read all.
create policy "Zone admins can read logs in their zone"
  on notification_logs for select
  to authenticated
  using (
    exists (
      select 1 from notifications n
      join user_profiles up on up.id = auth.uid()
      where n.id = notification_logs.notification_id
        and up.role = 'zone_admin'
        and (
          (n.recipient_type = 'participant' and exists (
            select 1 from registrations r
            where r.id = n.recipient_id::uuid and r.zone_id = up.zone_id
          ))
          or
          (n.recipient_type = 'guardian' and exists (
            select 1 from guardians g
            join registrations r on r.id = g.registration_id
            where g.id = n.recipient_id::uuid and r.zone_id = up.zone_id
          ))
        )
    )
  );

create policy "HQ admins can read all notification logs"
  on notification_logs for select
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role = 'hq_admin'
    )
  );
