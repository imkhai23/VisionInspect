/**
 * Supabase browser client — dùng trong Client Components.
 * Token: lấy từ cookie `access_token` (do FastAPI auth trả về sau login Supabase).
 *
 * Ví dụ:
 *   const supabase = createSupabaseBrowserClient();
 *   const { data } = await supabase.from('predictions').select('*').limit(10);
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { tokenStorage } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function createSupabaseBrowserClient(): SupabaseClient {
  if (!isSupabaseBrowserConfigured()) {
    throw new Error(
      'Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong frontend/.env.local',
    );
  }

  const token = tokenStorage.get();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}
