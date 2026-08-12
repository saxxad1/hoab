import { createClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "./config";

type AdminClient = ReturnType<typeof createClient>;

let client: AdminClient | undefined;

export function getSupabaseAdmin() {
  if (!client) {
    client = createClient(supabaseUrl(), supabaseServiceRoleKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}
