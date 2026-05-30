# VisionInspect — Hướng dẫn chạy SQL Scripts trên Supabase

## Thứ tự chạy

Chạy đúng thứ tự sau để tránh lỗi:

1. `01_create_tables.sql` — Tạo toàn bộ bảng, triggers, RLS
2. `02_sample_data.sql`  — Thêm dữ liệu mẫu để demo

## Cách chạy

1. Truy cập: https://supabase.com/dashboard
2. Chọn dự án **VisionInspect**
3. Vào menu bên trái: **SQL Editor**
4. Bấm **New query**
5. Copy toàn bộ nội dung file SQL và Paste vào ô soạn thảo
6. Bấm nút **Run** (hoặc Ctrl+Enter)
7. Lặp lại cho file tiếp theo

## Mô tả các bảng

| Bảng | Mô tả |
|------|-------|
| `users` | Thông tin người dùng, liên kết với Supabase Auth |
| `predictions` | Kết quả phân tích ảnh sản phẩm bằng YOLOv8 |
| `subscriptions` | Gói đăng ký của từng user (Free/Pro) |
| `usage_logs` | Nhật ký hoạt động của người dùng |

## Dữ liệu mẫu đã tạo

- **5 kết quả predictions**: 2 sản phẩm đạt (good), 3 sản phẩm lỗi (scratch, dent, crack)
- **5 usage logs**: Tương ứng với 5 lần phân tích ảnh
