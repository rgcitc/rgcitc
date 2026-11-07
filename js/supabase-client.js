/**
 * Supabase Client Configuration for RGCITC
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project credentials
 * from https://supabase.com/dashboard/project/<your-project>/settings/api
 */

const SUPABASE_CONFIG = {
  url: window.__ENV_SUPABASE_URL || "https://YOUR_PROJECT_ID.supabase.co",
  anonKey: window.__ENV_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_PUBLIC_KEY"
};

// Initialize Supabase Client (from CDN)
let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }
  return supabaseClient;
}
