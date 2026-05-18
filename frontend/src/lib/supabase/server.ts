/**
 * Supabase server client — dùng trong Server Components / Route Handlers.
 * Đọc access_token từ cookie để RLS áp dụng theo user đăng nhập.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function isSupabaseServerConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  if (!isSupabaseServerConfigured()) {
    throw new Error(
      'Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong frontend/.env.local',
    );
  }

  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}
