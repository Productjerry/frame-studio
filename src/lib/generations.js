import { supabase } from "./supabase.js";

// Upload a finished DP blob to the public 'dps' bucket, then record it.
export async function shareGeneration(blob, templateId = null) {
  if (!blob) return null;
  const path = `dps/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  const { error: upErr } = await supabase.storage.from("dps").upload(path, blob, {
    cacheControl: "3600", upsert: false, contentType: "image/png",
  });
  if (upErr) { console.error(upErr); return null; }
  const { data } = supabase.storage.from("dps").getPublicUrl(path);
  const image_url = data.publicUrl;
  const { error } = await supabase.from("generations").insert({ image_url, template_id: templateId });
  if (error) { console.error(error); return null; }
  return image_url;
}

// Record a usage WITHOUT sharing a public image (for accurate per-theme counts
// even when the user declines to share). Stores only the template reference.
export async function recordUsage(templateId) {
  if (!templateId) return;
  const { error } = await supabase.from("generations").insert({ image_url: "", template_id: templateId });
  if (error) console.error(error);
}

// Most recent shared DPs (newest first), capped. Skips usage-only rows.
export async function fetchRecentGenerations(limit = 8) {
  const { data, error } = await supabase
    .from("generations")
    .select("image_url, created_at")
    .neq("image_url", "")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error(error); return []; }
  return data || [];
}

export function subscribeGenerations(onChange) {
  const channel = supabase
    .channel("generations-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "generations" }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
