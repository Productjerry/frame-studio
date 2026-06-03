-- ============================================================
--  Frame Studio — Supabase setup
--  Run this in the Supabase dashboard:  SQL Editor -> New query -> Run
-- ============================================================

-- 1. Templates table -----------------------------------------
create table if not exists public.templates (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  uses       int4 default 0,
  updated    text default 'just now',
  active     boolean default false,      -- active == published to users
  tier       text default 'Free',
  color      text default '#2563eb',
  image_url  text,
  created_at timestamptz default now()
);

-- 2. Row Level Security --------------------------------------
-- Anyone can READ templates (attendees need to see published frames),
-- but only SIGNED-IN admins can insert / update / delete.
alter table public.templates enable row level security;

create policy "public read templates"
  on public.templates for select
  using (true);

create policy "authed insert templates"
  on public.templates for insert
  to authenticated
  with check (true);

create policy "authed update templates"
  on public.templates for update
  to authenticated
  using (true);

create policy "authed delete templates"
  on public.templates for delete
  to authenticated
  using (true);

-- 3. Realtime -------------------------------------------------
-- Lets the user page update instantly when admin publishes.
alter publication supabase_realtime add table public.templates;

-- 4. Storage bucket for frame PNGs ---------------------------
-- Easiest path: create the bucket in the dashboard (Storage -> New bucket,
-- name it "frames", toggle "Public bucket" ON). If you prefer SQL:
insert into storage.buckets (id, name, public)
values ('frames', 'frames', true)
on conflict (id) do nothing;

-- Public can read frames; only signed-in admins can upload:
create policy "public read frames"
  on storage.objects for select
  using (bucket_id = 'frames');

create policy "authed upload frames"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'frames');
