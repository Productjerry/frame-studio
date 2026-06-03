import { supabase } from "./supabase.js";

// Sign in an existing admin with email + password.
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data?.user || null, error: error?.message || null };
}

// Sign out the current admin.
export async function signOut() {
  await supabase.auth.signOut();
}

// Get the current session once (on page load).
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

// Subscribe to login/logout changes. Returns an unsubscribe function.
export function onAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data?.subscription?.unsubscribe();
}
