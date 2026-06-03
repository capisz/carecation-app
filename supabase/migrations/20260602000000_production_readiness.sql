create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin', 'provider')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Carecation plan',
  status text not null default 'active' check (status in ('active', 'archived')),
  plan_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.care_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (
    item_type in ('flight', 'hotel', 'healthcare_estimate', 'travel_recommendation')
  ),
  item_snapshot jsonb not null default '{}'::jsonb,
  source text not null default 'carecation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, item_type)
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  country text not null,
  city text not null,
  specialty text,
  description text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  plan_id uuid references public.care_plans(id) on delete set null,
  provider_id text,
  provider_name text,
  contact_name text not null,
  email text not null,
  phone text,
  travel_window text,
  notes text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'sent', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_applications (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references auth.users(id) on delete set null,
  clinic_name text not null,
  provider_type text not null,
  contact_name text not null,
  email text not null,
  phone text,
  country text not null,
  city text not null,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'approved', 'rejected')),
  payload jsonb not null default '{}'::jsonb,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  institution text not null,
  rating int not null check (rating between 1 and 5),
  review text not null,
  reviewer_name text,
  anonymous boolean not null default false,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  plan_id uuid references public.care_plans(id) on delete set null,
  partner text not null,
  outbound_url text not null,
  destination_country text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists care_plans_user_id_updated_at_idx
  on public.care_plans(user_id, updated_at desc);
create index if not exists plan_items_plan_id_idx on public.plan_items(plan_id);
create index if not exists quote_requests_user_id_created_at_idx
  on public.quote_requests(user_id, created_at desc);
create index if not exists affiliate_clicks_plan_id_created_at_idx
  on public.affiliate_clicks(plan_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists care_plans_set_updated_at on public.care_plans;
create trigger care_plans_set_updated_at
before update on public.care_plans
for each row execute function public.set_updated_at();

drop trigger if exists plan_items_set_updated_at on public.plan_items;
create trigger plan_items_set_updated_at
before update on public.plan_items
for each row execute function public.set_updated_at();

drop trigger if exists providers_set_updated_at on public.providers;
create trigger providers_set_updated_at
before update on public.providers
for each row execute function public.set_updated_at();

drop trigger if exists quote_requests_set_updated_at on public.quote_requests;
create trigger quote_requests_set_updated_at
before update on public.quote_requests
for each row execute function public.set_updated_at();

drop trigger if exists provider_applications_set_updated_at on public.provider_applications;
create trigger provider_applications_set_updated_at
before update on public.provider_applications
for each row execute function public.set_updated_at();

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.care_plans enable row level security;
alter table public.plan_items enable row level security;
alter table public.providers enable row level security;
alter table public.quote_requests enable row level security;
alter table public.provider_applications enable row level security;
alter table public.testimonials enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.audit_events enable row level security;

create policy "Profiles are readable by owner"
on public.profiles for select
using (auth.uid() = id);

create policy "Profiles are editable by owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Care plans are owned by user"
on public.care_plans for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Plan items are owned by user"
on public.plan_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Approved providers are public"
on public.providers for select
using (status = 'approved');

create policy "Users can read their quote requests"
on public.quote_requests for select
using (auth.uid() = user_id);

create policy "Anyone can submit quote requests"
on public.quote_requests for insert
with check (true);

create policy "Anyone can submit provider applications"
on public.provider_applications for insert
with check (true);

create policy "Users can read their provider applications"
on public.provider_applications for select
using (auth.uid() = submitted_by);

create policy "Approved testimonials are public"
on public.testimonials for select
using (status = 'approved');

create policy "Anyone can submit testimonials"
on public.testimonials for insert
with check (true);

create policy "Users can write affiliate clicks"
on public.affiliate_clicks for insert
with check (auth.uid() = user_id or user_id is null);

create policy "Users can write audit events"
on public.audit_events for insert
with check (auth.uid() = user_id or user_id is null);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
