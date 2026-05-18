# Supabase trên Frontend (Next.js)

Scaffold `@supabase/supabase-js` để đáp ứng đề cương **truy vấn Supabase trực tiếp từ client** (RLS với anon key + JWT).

## Cấu hình

Thêm vào `frontend/.env.local` (lấy từ Supabase Dashboard → Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Giữ nguyên `NEXT_PUBLIC_API_URL` cho FastAPI (predict, stream, training).

## File

| File | Mục đích |
|------|----------|
| `src/lib/supabase/client.ts` | Client Component — đọc cookie `access_token` |
| `src/lib/supabase/server.ts` | Server Component — đọc cookie qua `next/headers` |
| `src/lib/supabase/predictions.ts` | Helper ví dụ `fetchRecentPredictions` |

## Ví dụ Client Component

```tsx
'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient, isSupabaseBrowserConfigured } from '@/lib/supabase/client';
import { fetchRecentPredictions } from '@/lib/supabase/predictions';

export function RecentPredictionsSupabase() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    fetchRecentPredictions(supabase, 5).then(setRows).catch(console.error);
  }, []);

  // render rows...
}
```

## Ví dụ Server Component

```tsx
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { fetchRecentPredictions } from '@/lib/supabase/predictions';

export default async function DashboardSupabasePreview() {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const rows = await fetchRecentPredictions(supabase, 5);
  return <pre>{JSON.stringify(rows, null, 2)}</pre>;
}
```

## Lưu ý bảo mật

- Chỉ dùng **anon key** trên frontend, không đặt `service_role`.
- Token user lấy từ cookie sau `/auth/login` (Supabase access token).
- RLS trong `supabase_setup.sql` phải được áp dụng khi gọi bằng JWT user (không phải service role).

## Báo cáo đồ án

Ghi rõ: **FastAPI** xử lý AI/upload nặng; **Supabase client** dùng cho đọc dữ liệu có RLS trực tiếp từ Next.js.
