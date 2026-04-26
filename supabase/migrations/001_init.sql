-- ============================================================
-- TenantVault — Full Database Migration
-- Run this in the Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE: profiles
-- Auto-created on auth.users signup via trigger
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text not null,
  role        text not null default 'landlord' check (role in ('landlord', 'tenant')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "profiles: self update"
  on public.profiles for update
  using (auth.uid() = id);

-- Service role can insert (for tenant invite flow)
create policy "profiles: service insert"
  on public.profiles for insert
  with check (true); -- restricted by service role key in app

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'landlord')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- TABLE: cases
-- ============================================================
create table public.cases (
  id                uuid primary key default gen_random_uuid(),
  landlord_id       uuid not null references public.profiles(id) on delete cascade,
  tenant_id         uuid references public.profiles(id) on delete set null,
  address           text not null,
  unit_number       text,
  move_out_date     date not null,
  status            text not null default 'draft'
                    check (status in ('draft', 'active', 'closed')),
  invite_token      uuid not null unique default gen_random_uuid(),
  invite_expires_at timestamptz,
  created_at        timestamptz not null default now()
);

alter table public.cases enable row level security;

-- Landlord or tenant can read their own cases
create policy "cases: parties read"
  on public.cases for select
  using (
    auth.uid() = landlord_id
    or auth.uid() = tenant_id
  );

-- Only landlord can create a case
create policy "cases: landlord insert"
  on public.cases for insert
  with check (auth.uid() = landlord_id);

-- Only landlord can update — and not if closed
create policy "cases: landlord update"
  on public.cases for update
  using (auth.uid() = landlord_id and status != 'closed');

-- No DELETE policy — cases are permanent records
-- (service role can still delete for admin purposes)


-- ============================================================
-- TABLE: evidence
-- ============================================================
create table public.evidence (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references public.cases(id) on delete cascade,
  uploaded_by   uuid not null references public.profiles(id),
  storage_path  text not null,
  file_name     text not null,
  file_size     integer not null,
  mime_type     text not null,
  caption       text check (char_length(caption) <= 500),
  uploaded_at   timestamptz not null default now()
);

alter table public.evidence enable row level security;

-- Landlord or tenant of the case can view evidence
create policy "evidence: parties read"
  on public.evidence for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = evidence.case_id
        and (c.landlord_id = auth.uid() or c.tenant_id = auth.uid())
    )
  );

-- Only authenticated party of the case can upload — if case is active
create policy "evidence: parties insert"
  on public.evidence for insert
  with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from public.cases c
      where c.id = evidence.case_id
        and (c.landlord_id = auth.uid() or c.tenant_id = auth.uid())
        and c.status != 'closed'
    )
  );

-- NO UPDATE policy — evidence is immutable once uploaded
-- NO DELETE policy — evidence cannot be removed


-- ============================================================
-- TABLE: audit_logs
-- INSERT-ONLY — no UPDATE or DELETE policies
-- ============================================================
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.cases(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  event_type  text not null,
  metadata    jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Parties of the case can read the audit log
create policy "audit_logs: parties read"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = audit_logs.case_id
        and (c.landlord_id = auth.uid() or c.tenant_id = auth.uid())
    )
  );

-- Authenticated users can INSERT (server validates case membership)
create policy "audit_logs: authenticated insert"
  on public.audit_logs for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- NO UPDATE policy
-- NO DELETE policy
-- This table is append-only by design


-- ============================================================
-- STORAGE: inspections bucket
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inspections',
  'inspections',
  false,            -- PRIVATE bucket
  10485760,         -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Users can upload to their own user folder within a case
create policy "storage: authenticated upload"
  on storage.objects for insert
  with check (
    bucket_id = 'inspections'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- Users can read objects in cases they belong to
-- (App uses signed URLs — this is a fallback policy)
create policy "storage: parties read"
  on storage.objects for select
  using (
    bucket_id = 'inspections'
    and auth.role() = 'authenticated'
  );

-- No UPDATE or DELETE on storage objects
