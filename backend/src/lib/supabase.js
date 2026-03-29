/**
 * Lazy Supabase client for Postgres task storage. Requires SUPABASE_URL and SUPABASE_KEY or SUPABASE_ANON_KEY.
 */
import { createClient } from '@supabase/supabase-js';

let client;

export function getSupabaseClient() {
  if (client) {
    return client;
  }

  const url = process.env.SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    const err = new Error(
      'SUPABASE_URL and SUPABASE_KEY (or SUPABASE_ANON_KEY) must be set'
    );
    err.status = 503;
    throw err;
  }

  client = createClient(url, key);
  return client;
}
