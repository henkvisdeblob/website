-- Waitlist for phase 0 (validation). See docs/04 (E1) and docs/09 (privacy).
create table public.waitlist (
  email             text primary key check (email = lower(email) and length(email) <= 254),
  referral_code     text not null unique check (referral_code ~ '^[a-z0-9]{8}$'),
  referred_by       text,
  utm_source        text check (utm_source is null or length(utm_source) <= 64),
  stores            text[] not null default '{}',
  household_size    smallint check (household_size between 1 and 8),
  token_hash        text not null unique,
  token_created_at  timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  confirmed_at      timestamptz
);

create index waitlist_confirmed_at_idx on public.waitlist (confirmed_at) where confirmed_at is not null;
create index waitlist_referred_by_idx on public.waitlist (referred_by) where referred_by is not null;

-- Only the server (secret / service role key) may read or write. No policies = no access for anon/authenticated.
alter table public.waitlist enable row level security;

comment on table public.waitlist is
  'Phase-0 waitlist. Personal data: email (+ optional stores/household size). Delete 6 months after launch or on request.';
