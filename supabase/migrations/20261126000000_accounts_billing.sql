-- Accounts and Premium subscriptions. See docs/07 (data model, entitlements, Stripe) and docs/09 (consumer law).
-- Stripe is the source of truth for subscriptions; these rows are a mirror written only by the webhook.

-- One profile per account. For now it only holds billing fields; preferences follow in a later migration.
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  created_at          timestamptz not null default now(),
  premium_trial_until timestamptz,
  stripe_customer_id  text unique
);

create table public.subscriptions (
  id                   text primary key,                -- Stripe subscription ID
  user_id              uuid not null references public.profiles (id) on delete cascade,
  status               text not null,                   -- active, trialing, past_due, canceled, …
  price_id             text not null,
  interval             text not null check (interval in ('month', 'year')),
  started_at           timestamptz not null,            -- start of the contract: the 14-day withdrawal period counts from here
  current_period_end   timestamptz not null,
  cancel_at_period_end boolean not null default false,
  withdrawn_at         timestamptz,                     -- set when "Overeenkomst herroepen" was used
  updated_at           timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);

-- Stripe retries webhooks, so every event is recorded and processed at most once.
create table public.stripe_events (
  id           text primary key,                        -- Stripe event ID
  type         text not null,
  processed_at timestamptz not null default now()
);

-- Every new account starts with 14 days of Premium, without payment details and without
-- turning into a paid subscription on its own (docs/04 US-3.1, docs/09 "Gratis proefperiode").
create function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, premium_trial_until)
  values (new.id, now() + interval '14 days')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security: users may read their own rows and nothing else. There are deliberately no
-- insert/update/delete policies: billing fields (trial, customer ID, status) are written only by the
-- server with the secret key. When preferences are added to profiles, grant updates on those columns only.
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "subscriptions: read own" on public.subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- stripe_events has no policies: server only.

comment on table public.profiles is 'One row per account. Personal data; deleted with the account (docs/09).';
comment on table public.subscriptions is 'Mirror of Stripe subscriptions, written only by the Stripe webhook.';
comment on table public.stripe_events is 'Processed Stripe webhook event IDs, for idempotency.';
