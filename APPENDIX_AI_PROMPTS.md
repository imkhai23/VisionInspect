# PHỤ LỤC — MINH CHỨNG SỬ DỤNG AI TOOL TRONG PHÁT TRIỂN

**Đề tài:** VisionInspect — AI Product Defect Detection SaaS  
**Môn học:** Các công nghệ mới trong phát triển phần mềm  
**Công cụ AI chính:** Cursor IDE (Agent), hỗ trợ bởi mô hình ngôn ngữ lớn  
**Ngày lập:** 18/05/2026  

---

## 1. Mục đích sử dụng AI

AI được dùng để: (1) sinh boilerplate nhanh, (2) gợi ý schema SQL/RLS, (3) debug tích hợp Supabase, (4) tối ưu Docker, (5) viết UI Tailwind. Mọi đoạn code do AI gợi ý đều được **đọc, chạy thử và chỉnh sửa thủ công** trước khi commit.

---

## 2. Bảng prompts đã thực hiện (>5)

| # | Mục đích | Prompt đã dùng (tóm tắt) | Kết quả AI | Chỉnh sửa thủ công | Bài học |
|---|----------|--------------------------|------------|-------------------|---------|
| 1 | Schema Supabase + RLS | *"Viết file SQL tạo bảng users, predictions, subscriptions, usage_logs cho Supabase; bật RLS; policy chỉ user xem/sửa dữ liệu của mình; trigger sync auth.users → public.users"* | Sinh `supabase_setup.sql` với policies `auth.uid() = user_id` | Thêm bảng training (`datasets`, `training_jobs`…); sửa policy admin tables | AI sinh SQL nhanh nhưng cần review policy `authenticated using (true)` — quá rộng cho bảng admin |
| 2 | Tích hợp Supabase Auth backend | *"Chuyển router auth FastAPI sang signup/login Supabase Auth; trả access_token Supabase; middleware validate token bằng get_user"* | `supabase_auth.py`, cập nhật `auth.py`, `middleware/auth.py` | Bỏ JWT tự ký cũ; đồng bộ user vào bảng `users` sau login | Không trộn JWT custom với Supabase session — chọn một nguồn token |
| 3 | Upload ảnh Supabase Storage | *"Trong endpoint predict, upload file lên bucket predictions, lưu image_url vào bảng predictions"* | Code `storage.from_("predictions").upload` trong `predict.py` | Cấu hình bucket public/read policy trên dashboard Supabase; script `backfill_image_urls.py` | Phải tạo bucket và policy Storage trên Supabase trước khi test |
| 4 | Docker full stack | *"docker-compose với backend FastAPI, frontend Next standalone, redis, training worker; mount ai/weights"* | `docker-compose.yml`, multi-stage `frontend/Dockerfile` | `ENABLE_VIDEO_PROCESSOR=false` mặc định; context build `.` cho backend | Image AI rất nặng — tách worker hoặc build riêng nếu máy yếu |
| 5 | Trang admin training YOLO | *"Next.js page admin: form tạo training job, WebSocket theo dõi epoch, chart loss/mAP"* | `dashboard/admin/training/page.tsx` + WS backend | Kết nối Redis/RQ worker; dịch VI/EN trong `LanguageContext` | WebSocket training ≠ Supabase Realtime — ghi rõ trong báo cáo |
| 6 | Realtime MJPEG + overlay | *"FastAPI stream MJPEG và WebSocket metadata bbox; React LiveView vẽ canvas overlay"* | `stream.py`, `LiveView.tsx`, `vision_engine.py` | Zoom, đổi nguồn camera WiFi/IP trên `realtime/page.tsx` | Đồng bộ kích thước canvas với kích thước ảnh MJPEG khi resize |
| 7 | Đánh giá đồ án vs quy chế | *"So sánh toàn bộ project với QUY-CHE-THI-CUOI-KY; báo cáo tiếng Việt từng tiêu chí"* | Báo cáo đánh giá + checklist hành động | Cập nhật `TONGHOP.md`, phụ lục này, scaffold `@supabase/ssr` | AI giúp audit nhanh; sinh viên vẫn phải tự deploy VPS và nộp link demo |

---

## 3. Prompt mẫu đầy đủ (Prompt #1 — Schema RLS)

```
Bạn là chuyên gia Supabase Postgres. Hãy viết migration SQL cho ứng dụng VisionInspect:
- Bảng: users (id uuid FK auth.users), predictions, subscriptions, usage_logs
- Trigger after insert on auth.users để tạo profile + subscription free
- Bật RLS trên mọi bảng
- Policy: user chỉ SELECT/INSERT/UPDATE dữ liệu có user_id = auth.uid()
- Index cho predictions(user_id, created_at desc)
Output: một file .sql chạy được trên Supabase SQL Editor.
```

**Kết quả:** File `supabase_setup.sql` (phiên bản đầu ~180 dòng).  
**Chỉnh sửa:** Mở rộng thêm 6 bảng training platform và policies đọc cho `authenticated`.  
**Đánh giá:** Tiết kiệm ~2–3 giờ so với viết tay từ đầu.

---

## 4. Prompt mẫu đầy đủ (Prompt #4 — Docker)

```
Tạo docker-compose.yml cho VisionInspect:
- backend: build từ backend/Dockerfile, context repo root, copy cả thư mục ai/
- frontend: Next.js 14 standalone port 3000
- redis cho training queue
- training-worker chạy python -m app.workers.training_worker
- env từ file .env
Liệt kê biến môi trường bắt buộc.
```

**Kết quả:** `docker-compose.yml` hiện tại.  
**Chỉnh sửa:** Thêm volume `./ai/weights`, tắt video processor trong container.  
**Đánh giá:** Cần test `docker compose up --build` trên máy thật — AI không thay được việc kiểm tra GPU/CUDA.

---

## 5. Giới hạn và trách nhiệm người phát triển

| Rủi ro khi dùng AI | Cách xử lý trong dự án |
|--------------------|-------------------------|
| SQL/policy sai bảo mật | Chạy `supabase_setup.sql` trên project test; review từng `CREATE POLICY` |
| Code không chạy được | Chạy `npm run build`, `uvicorn`, `pytest` sau mỗi thay đổi lớn |
| Lộ service_role key | Chỉ đặt trong `backend/.env`, không commit; `.gitignore` đã loại trừ `.env` |
| Hallucination API Supabase | Đối chiếu https://supabase.com/docs |

---

## 6. Kết luận

AI tool đóng vai trò **trợ lý lập trình**, không thay thế hiểu biết về RLS, Docker và kiến trúc. Các phần cốt lõi (demo production, giải thích vấn đáp, quyết định dùng FastAPI làm AI layer) do sinh viên nắm và trình bày trong báo cáo chính.

---

*Tài liệu này nộp kèm LMS theo yêu cầu mục 4.2 — Minh chứng AI.*
