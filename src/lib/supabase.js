import { createClient } from "@supabase/supabase-js";

// These come from your Supabase project (Settings -> API) and are set as
// environment variables. In Vite, any var prefixed with VITE_ is exposed to
// the browser. The anon key is safe to ship to the client.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Helpful console message instead of a cryptic crash if env vars are missing.
  console.warn(
    "[Frame Studio] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env.local and fill them in."
  );
}

export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder");
