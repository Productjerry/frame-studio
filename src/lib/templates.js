import { supabase } from "./supabase.js";

/* ------------------------------------------------------------------
   Templates data layer.

   Table `templates`:
     id        uuid  primary key default gen_random_uuid()
     name      text
     uses      int4  default 0
     updated   text                      -- human label e.g. "2d ago"
     active    bool  default false        -- "active" == published to users
     tier      text  default 'Free'
     color     text  default '#2563eb'
     image_url text                       -- public URL of the frame PNG
     created_at timestamptz default now()

   Storage bucket `frames` (public) holds the uploaded PNG frames.
------------------------------------------------------------------ */

// Fetch every template (admin) — newest first.
export async function fetchTemplates() {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

// Fetch only published/active templates (user side).
export async function fetchPublishedTemplates() {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

// Upload a frame image to Storage, then insert a template row.
export async function createTemplate(file, meta = {}) {
  let image_url = null;
  if (file) {
    const path = `frames/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error: upErr } = await supabase.storage.from("frames").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) { console.error(upErr); }
    else {
      const { data } = supabase.storage.from("frames").getPublicUrl(path);
      image_url = data.publicUrl;
    }
  }
  const row = {
    name: meta.name || file?.name?.replace(/\.[^.]+$/, "") || "New Frame",
    uses: 0,
    updated: "just now",
    active: false,
    tier: meta.tier || "Free",
    color: meta.color || "#2563eb",
    image_url,
    shape: meta.shape || "circle",   // 'circle' | 'square'
    ratio: meta.ratio || "square",   // 'square' | 'portrait'
    slot: meta.slot || null,         // {x,y,w,h} fractions of canvas
  };
  const { data, error } = await supabase.from("templates").insert(row).select().single();
  if (error) { console.error(error); return null; }
  return data;
}

// Returns a map { template_id: count } of how many DPs were generated per theme.
export async function fetchUsageCounts() {
  const { data, error } = await supabase.from("generations").select("template_id");
  if (error) { console.error(error); return {}; }
  const counts = {};
  (data || []).forEach((r) => { if (r.template_id) counts[r.template_id] = (counts[r.template_id] || 0) + 1; });
  return counts;
}

export async function setActive(id, active) {
  const { error } = await supabase.from("templates").update({ active }).eq("id", id);
  if (error) console.error(error);
}

export async function publishAll() {
  const { error } = await supabase.from("templates").update({ active: true }).neq("id", "");
  if (error) console.error(error);
}

export async function deleteTemplate(id) {
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) console.error(error);
}

// Live subscription: user pages call this to react to admin publishes instantly.
export function subscribeTemplates(onChange) {
  const channel = supabase
    .channel("templates-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "templates" }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
