# HƯỚNG DẪN CHẠY DỰ ÁN VISIONINSPECT

Tài liệu này giúp bạn tự khởi động dự án từ A-Z mỗi khi mở máy tính mà không cần nhớ lệnh phức tạp.

---

## 1. MỞ 2 CỬA SỔ TERMINAL (POWERSHELL)
Để dự án hoạt động, bạn cần chạy **Backend** (Server) và **Frontend** (Giao diện) song song.

### Cửa sổ 1: Chạy Backend (Python)
1. Di chuyển vào thư mục backend:
   ```powershell
   cd D:\VisionInspect\backend
   ```
2. Kích hoạt môi trường ảo (Venv):
   ```powershell
   .\venv\Scripts\activate
   ```
3. Chạy lệnh khởi động server:
   ```powershell
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Khi thấy dòng `Uvicorn running on http://127.0.0.1:8000` là thành công.*

---

### Cửa sổ 2: Chạy Frontend (Next.js)
1. Di chuyển vào thư mục frontend:
   ```powershell
   cd D:\VisionInspect\frontend
   ```
2. Chạy lệnh khởi động giao diện:
   ```powershell
   npm run dev
   ```
   *Khi thấy dòng `Ready in ...ms` là thành công.*

---

## 2. TRUY CẬP ỨNG DỤNG
Mở trình duyệt web (Chrome/Edge) và nhập địa chỉ:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 3. CÁC LỖI THƯỜNG GẶP & CÁCH SỬA NHANH

### Lỗi 1: Cổng 8000 hoặc 3000 đã bị chiếm dụng
Nếu báo lỗi "Address already in use", hãy chạy lệnh này để xóa tiến trình cũ:
- **Xóa Backend cũ:** `taskkill /F /IM python.exe`
- **Xóa Frontend cũ:** `taskkill /F /IM node.exe`

### Lỗi 2: Thiếu thư viện (ModuleNotFoundError)
Nếu bạn mới tải code về hoặc cập nhật, hãy chạy:
- **Cho Backend:** `pip install -r requirements.txt` (trong venv)
- **Cho Frontend:** `npm install`

### Lỗi 3: Không đăng nhập được
- Kiểm tra xem Terminal Backend có báo lỗi màu đỏ không.
- Đảm bảo file `.env` trong thư mục `backend` và `.env.local` trong `frontend` có đầy đủ thông tin Supabase.

---

## MẸO NHỎ (PRO TIP):
Bạn có thể tạo một file tên là `START.bat` ở thư mục gốc `D:\VisionInspect` với nội dung sau để mở cả 2 chỉ bằng 1 cái click chuột:

```batch
@echo off
start cmd /k "cd /d D:\VisionInspect\backend && .\venv\Scripts\activate && python -m uvicorn app.main:app --port 8000"
start cmd /k "cd /d D:\VisionInspect\frontend && npm run dev"
```
*(Chỉ cần lưu đoạn trên vào file .bat và nhấn đúp vào nó mỗi khi muốn làm việc!)*
