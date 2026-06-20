-- ============================================================
--  Schema v3 — dynamic text templates
--  Run ONCE in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- A theme can carry an optional dynamic-text config:
--   { text, box:{x,y,w,h}, fontSize, color, align, font }
-- where `text` contains a {name} placeholder the user fills in.
alter table public.templates add column if not exists dyntext jsonb;
