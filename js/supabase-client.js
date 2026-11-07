/**
 * Supabase Client Configuration for RGCITC
 */

const SUPABASE_CONFIG = {
  url: "https://gujxkdrhmchunwfuqbfg.supabase.co",
  anonKey: "sb_publishable_Q5M0bA8oswuAUOdlrmrn7Q_tFsdemrA"
};

// Initialize Supabase Client
let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }
  return supabaseClient;
}
