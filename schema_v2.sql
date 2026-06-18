-- ============================================================
--  Schema v2 — theme shape/ratio/slot + per-theme usage counts
--  Run this ONCE in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- New columns on templates (all optional, with sensible defaults)
alter table public.templates add column if not exists shape text default 'circle';   -- 'circle' | 'square'
alter table public.templates add column if not exists ratio text default 'square';    -- 'square' (1080x1080) | 'portrait' (1080x1350)
alter table public.templates add column if not exists slot  jsonb;                     -- {x,y,w,h} fractions 0..1 of the canvas

-- Tag each generation with the theme used, so usage can be counted per theme.
alter table public.generations add column if not exists template_id uuid;
create index if not exists generations_template_idx on public.generations (template_id);
