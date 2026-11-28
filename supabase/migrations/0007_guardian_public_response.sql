-- Migration: 0007_guardian_public_response
-- Description: Public guardian consent response flow (Phase 9)
-- Adds a response_token to guardian_responses so guardians can respond
-- via a public email link without authentication.

-- ------------------------------------------------------------
-- guardian_responses: add response_token
-- ------------------------------------------------------------
alter table guardian_responses
  add column if not exists response_token uuid unique default gen_random_uuid();

comment on column guardian_responses.response_token is
  'Single-use token for public guardian consent response link. Null until a response is requested.';

create index idx_guardian_responses_response_token on guardian_responses(response_token);

-- ------------------------------------------------------------
-- Row Level Security: public token-based access
-- ------------------------------------------------------------

-- Public can read a guardian response by response_token (to verify the link before showing the form).
create policy "Public can read guardian response by response token"
  on guardian_responses for select
  to public
  using (response_token is not null);

-- Public can update a guardian response by response_token, only when still pending.
create policy "Public can update guardian response by response token"
  on guardian_responses for update
  to public
  using (
    response_token is not null
    and response = 'pending'
  )
  with check (
    response_token is not null
    and response = 'pending'
  );
