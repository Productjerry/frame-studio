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

-- ============================================================
--  Generated DPs gallery (added later)
--  Stores DPs that users explicitly chose to share publicly.
-- ============================================================

create table if not exists public.generations (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  created_at timestamptz default now()
);

alter table public.generations enable row level security;

-- Anyone can read (it's a public gallery) and anyone can add their own DP
-- (regular attendees aren't logged in). Deletes are not public.
create policy "public read generations"
  on public.generations for select
  using (true);

create policy "public insert generations"
  on public.generations for insert
  with check (true);

alter publication supabase_realtime add table public.generations;

-- Storage bucket for the shared DP images (public, like frames):
insert into storage.buckets (id, name, public)
values ('dps', 'dps', true)
on conflict (id) do nothing;

create policy "public read dps"
  on storage.objects for select
  using (bucket_id = 'dps');

create policy "public upload dps"
  on storage.objects for insert
  with check (bucket_id = 'dps');
