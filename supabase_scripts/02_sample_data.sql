-- ============================================================
-- VisionInspect — Script 02: Dữ liệu mẫu (Sample Data)
-- Môn: Các công nghệ mới trong phát triển phần mềm
-- Hướng dẫn: Chạy sau file 01_create_tables.sql
-- LƯU Ý: Dữ liệu này dùng để DEMO/TEST, không phải dữ liệu thật
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- BẢNG USERS: Tạo 3 tài khoản mẫu (Admin + 2 User thường)
-- Lưu ý: Trong thực tế, users được tạo qua Supabase Auth
--         Đây là dữ liệu mẫu để minh họa cấu trúc bảng
-- ──────────────────────────────────────────────────────────────

-- Xóa dữ liệu cũ (nếu có) để tránh xung đột khi chạy lại
DELETE FROM public.usage_logs;
DELETE FROM public.predictions;
DELETE FROM public.subscriptions;
-- Không xóa bảng users vì liên kết với auth.users

-- Tạo dữ liệu mẫu cho bảng subscriptions (gói đăng ký)
-- (Giả sử đã có 3 user được đăng ký qua Auth với các UUID tương ứng)

-- ──────────────────────────────────────────────────────────────
-- BẢNG PREDICTIONS: Dữ liệu mẫu kết quả phân tích AI
-- ──────────────────────────────────────────────────────────────

-- Mẫu 1: Sản phẩm ĐẠT chất lượng (Good)
INSERT INTO public.predictions (
  id, user_id, image_filename, image_url,
  image_size_bytes, label, confidence, all_scores, processing_ms, created_at
)
SELECT
  gen_random_uuid(),
  id,  -- Lấy user đầu tiên trong bảng
  'product_001.jpg',
  'https://your-project.supabase.co/storage/v1/object/public/predictions/product_001.jpg',
  245760,   -- ~240KB
  'good',
  0.9823,   -- Độ tin cậy 98.23%
  '{"good": 0.9823, "scratch": 0.0112, "dent": 0.0065}'::JSONB,
  87,        -- Xử lý 87ms
  now() - INTERVAL '2 days'
FROM public.users LIMIT 1;

-- Mẫu 2: Sản phẩm BỊ LỖI — vết xước (Scratch)
INSERT INTO public.predictions (
  id, user_id, image_filename, image_url,
  image_size_bytes, label, confidence, all_scores, processing_ms, created_at
)
SELECT
  gen_random_uuid(),
  id,
  'product_002_scratch.jpg',
  'https://your-project.supabase.co/storage/v1/object/public/predictions/product_002_scratch.jpg',
  312400,
  'scratch',
  0.8764,   -- Độ tin cậy 87.64%
  '{"good": 0.0543, "scratch": 0.8764, "dent": 0.0693}'::JSONB,
  94,
  now() - INTERVAL '2 days' + INTERVAL '30 minutes'
FROM public.users LIMIT 1;

-- Mẫu 3: Sản phẩm BỊ LỖI — vết móp (Dent)
INSERT INTO public.predictions (
  id, user_id, image_filename, image_url,
  image_size_bytes, label, confidence, all_scores, processing_ms, created_at
)
SELECT
  gen_random_uuid(),
  id,
  'product_003_dent.jpg',
  'https://your-project.supabase.co/storage/v1/object/public/predictions/product_003_dent.jpg',
  198500,
  'dent',
  0.9145,
  '{"good": 0.0234, "scratch": 0.0621, "dent": 0.9145}'::JSONB,
  102,
  now() - INTERVAL '1 day'
FROM public.users LIMIT 1;

-- Mẫu 4: Sản phẩm ĐẠT (Good) - ngày hôm nay
INSERT INTO public.predictions (
  id, user_id, image_filename, image_url,
  image_size_bytes, label, confidence, all_scores, processing_ms, created_at
)
SELECT
  gen_random_uuid(),
  id,
  'product_004.jpg',
  'https://your-project.supabase.co/storage/v1/object/public/predictions/product_004.jpg',
  176320,
  'good',
  0.9956,
  '{"good": 0.9956, "scratch": 0.0031, "dent": 0.0013}'::JSONB,
  78,
  now() - INTERVAL '3 hours'
FROM public.users LIMIT 1;

-- Mẫu 5: Sản phẩm BỊ LỖI — vết nứt (Crack)
INSERT INTO public.predictions (
  id, user_id, image_filename, image_url,
  image_size_bytes, label, confidence, all_scores, processing_ms, created_at
)
SELECT
  gen_random_uuid(),
  id,
  'product_005_crack.jpg',
  'https://your-project.supabase.co/storage/v1/object/public/predictions/product_005_crack.jpg',
  289000,
  'crack',
  0.7893,
  '{"good": 0.0812, "scratch": 0.1295, "crack": 0.7893}'::JSONB,
  115,
  now() - INTERVAL '1 hour'
FROM public.users LIMIT 1;

-- ──────────────────────────────────────────────────────────────
-- BẢNG USAGE_LOGS: Nhật ký hoạt động người dùng
-- ──────────────────────────────────────────────────────────────

INSERT INTO public.usage_logs (id, user_id, action, extra_metadata, created_at)
SELECT gen_random_uuid(), id, 'predict',
  '{"image": "product_001.jpg", "result": "good"}'::JSONB,
  now() - INTERVAL '2 days'
FROM public.users LIMIT 1;

INSERT INTO public.usage_logs (id, user_id, action, extra_metadata, created_at)
SELECT gen_random_uuid(), id, 'predict',
  '{"image": "product_002_scratch.jpg", "result": "scratch"}'::JSONB,
  now() - INTERVAL '2 days' + INTERVAL '30 minutes'
FROM public.users LIMIT 1;

INSERT INTO public.usage_logs (id, user_id, action, extra_metadata, created_at)
SELECT gen_random_uuid(), id, 'predict',
  '{"image": "product_003_dent.jpg", "result": "dent"}'::JSONB,
  now() - INTERVAL '1 day'
FROM public.users LIMIT 1;

INSERT INTO public.usage_logs (id, user_id, action, extra_metadata, created_at)
SELECT gen_random_uuid(), id, 'predict',
  '{"image": "product_004.jpg", "result": "good"}'::JSONB,
  now() - INTERVAL '3 hours'
FROM public.users LIMIT 1;

INSERT INTO public.usage_logs (id, user_id, action, extra_metadata, created_at)
SELECT gen_random_uuid(), id, 'predict',
  '{"image": "product_005_crack.jpg", "result": "crack"}'::JSONB,
  now() - INTERVAL '1 hour'
FROM public.users LIMIT 1;

-- ──────────────────────────────────────────────────────────────
-- KIỂM TRA KẾT QUẢ (Chạy từng dòng riêng để xem)
-- ──────────────────────────────────────────────────────────────

-- Xem thống kê tổng quan:
-- SELECT label, COUNT(*) as so_luong, AVG(confidence) as do_tin_cay_tb
-- FROM public.predictions
-- GROUP BY label
-- ORDER BY so_luong DESC;

-- Xem lịch sử 7 ngày:
-- SELECT created_at::DATE as ngay, COUNT(*) as tong, 
--        SUM(CASE WHEN label = 'good' THEN 1 ELSE 0 END) as dat,
--        SUM(CASE WHEN label != 'good' THEN 1 ELSE 0 END) as loi
-- FROM public.predictions
-- WHERE created_at >= now() - INTERVAL '7 days'
-- GROUP BY ngay ORDER BY ngay;

-- ============================================================
-- KẾT THÚC Script 02
-- ============================================================
