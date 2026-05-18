/**
 * Ví dụ truy vấn Supabase trực tiếp từ frontend (RLS với anon key + JWT user).
 * Dùng song song với FastAPI — không thay thế toàn bộ API.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type PredictionRow = {
  id: string;
  user_id: string;
  image_filename: string;
  image_url: string | null;
  label: string;
  confidence: number;
  created_at: string;
};

export async function fetchRecentPredictions(
  client: SupabaseClient,
  limit = 5,
): Promise<PredictionRow[]> {
  const { data, error } = await client
    .from('predictions')
    .select('id, user_id, image_filename, image_url, label, confidence, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PredictionRow[];
}
