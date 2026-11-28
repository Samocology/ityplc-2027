import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.",
  );
}

/**
 * Browser Supabase client. Uses only the public (publishable/anon) key.
 * Data access is protected by Row Level Security, never by this client alone.
 * The generated Database type is attached in Phase 1.
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
