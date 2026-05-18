
# Phụ Lục

## Phụ lục A: Minh chứng sử dụng công cụ AI (GitHub Copilot)

Trong suốt quá trình phát triển dự án VisionInspect, công cụ lập trình cặp AI GitHub Copilot đã được sử dụng như một trợ lý đắc lực, giúp tăng tốc độ viết mã, gỡ lỗi, học hỏi các API mới và tối ưu hóa mã nguồn. Dưới đây là một số minh chứng tiêu biểu.

### A.1. Gợi ý và hoàn thiện mã nguồn

Copilot đã tỏ ra cực kỳ hữu ích trong việc gợi ý các đoạn mã lặp đi lặp lại hoặc có cấu trúc phổ biến, giúp tiết kiệm đáng kể thời gian gõ phím.

**Ví dụ 1: Hoàn thiện một API endpoint trong FastAPI**

Khi đang xây dựng router cho `training_admin`, sau khi gõ định nghĩa hàm, Copilot đã tự động gợi ý toàn bộ phần thân hàm dựa trên ngữ cảnh (tên hàm, schema Pydantic, dependency injection).

*(Ghi chú: Em hãy chụp một màn hình thực tế trong VS Code khi Copilot đang đưa ra một gợi ý dài và hữu ích. Ví dụ, khi em vừa khai báo `def create_training_job(...)` và Copilot gợi ý toàn bộ logic bên trong.)*

**Ví dụ 2: Viết component React ở Frontend**

Khi tạo một component `Card` mới, Copilot đã gợi ý cấu trúc JSX và các class của Tailwind CSS dựa trên tên của component và các props.

*(Ghi chú: Chụp màn hình tương tự cho một component React.)*

### A.2. Hỗ trợ gỡ lỗi (Debugging)

Khi gặp phải các lỗi khó hiểu, tính năng chat của Copilot đã giúp phân tích lỗi và đưa ra các hướng giải quyết khả thi.

**Ví dụ: Lỗi CORS giữa Next.js và FastAPI**

**Prompt đã hỏi Copilot:**
> I'm getting a CORS error in my Next.js app when calling my FastAPI backend, even though I've configured `CORSMiddleware`. The error is "Access to fetch at 'http://localhost:8000/api/predict' from origin 'http://localhost:3000' has been blocked by CORS policy". Here is my FastAPI CORS configuration: `...`

**Gợi ý từ Copilot:**
> The configuration looks mostly correct. However, there are a few common pitfalls:
> 1.  **Wildcard `allow_origins=["*"]` doesn't work with `allow_credentials=True`.** You must specify the exact origins.
> 2.  **The order of middleware matters.** Make sure `CORSMiddleware` is one of the first middleware you add.
> 3.  **Check the browser's network tab** for the `OPTIONS` preflight request. See what headers are being requested and if the server is responding correctly.
> 4.  **Ensure the Next.js app is actually running on `localhost:3000`**.
>
> Try changing your `allow_origins` to `["http://localhost:3000"]` and see if that resolves the issue.

*(Ghi chú: Em hãy tìm lại một đoạn hội thoại thực tế với Copilot khi em hỏi về một lỗi và chụp màn hình lại.)*

### A.3. Học và sử dụng API mới

Copilot giúp đẩy nhanh quá trình học và áp dụng các thư viện mới mà không cần rời khỏi trình soạn thảo mã nguồn.

**Ví dụ: Sử dụng Supabase Realtime**

**Prompt đã hỏi Copilot:**
> How do I use Supabase Realtime in a React functional component to listen for updates on the `training_jobs` table? The component should update its state when a row is updated.

**Mã nguồn được Copilot gợi ý:**
```javascript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function TrainingDashboard() {
  const [jobs, setJobs] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase.from('training_jobs').select('*');
      if (data) setJobs(data);
    };
    fetchJobs();
  }, []);

  // Listen for realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('realtime-jobs')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'training_jobs' },
        (payload) => {
          console.log('Change received!', payload);
          setJobs((currentJobs) =>
            currentJobs.map((job) =>
              job.id === payload.new.id ? payload.new : job
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ... render jobs
}
```
Đoạn mã này gần như hoàn chỉnh và có thể sử dụng ngay, bao gồm cả việc fetch dữ liệu ban đầu và dọn dẹp (cleanup) subscription khi component bị unmount.

### A.4. Viết tài liệu và chú thích

Copilot cũng hỗ trợ viết các chuỗi tài liệu (docstrings) cho hàm trong Python hoặc các bình luận giải thích các đoạn mã phức tạp.

*(Ghi chú: Chụp màn hình một hàm Python mà Copilot đã tự động tạo docstring cho em.)*

---

## Phụ lục B: Hướng dẫn cài đặt và sử dụng

Đây là các bước để cài đặt và chạy dự án VisionInspect trên môi trường local.

### B.1. Yêu cầu hệ thống

- Docker và Docker Compose
- Git
- Một tài khoản Supabase (có thể dùng bản miễn phí)

### B.2. Các bước cài đặt

1.  **Clone repository:**
    ```bash
    git clone [URL_REPOSITORY_CUA_BAN]
    cd visioninspect
    ```

2.  **Thiết lập Supabase:**
    -   Tạo một dự án mới trên Supabase.
    -   Đi đến mục "SQL Editor", sao chép toàn bộ nội dung của file `supabase_setup.sql` và chạy nó để tạo các bảng và chính sách RLS.
    -   Trong mục "Project Settings" > "API", lấy các thông tin sau:
        -   Project URL
        -   `anon` public key
        -   `service_role` secret key
    -   Trong mục "Database" > "Settings", lấy chuỗi kết nối URI của database.

3.  **Cấu hình biến môi trường:**
    -   Tạo một file tên là `.env` ở thư mục gốc của dự án.
    -   Sao chép nội dung từ file `.env.example` (nếu có) hoặc tự điền các biến sau:
    ```env
    # Supabase
    DATABASE_URL="[CHUỖI_KẾT_NỐI_DATABASE_CỦA_SUPABASE]"
    SUPABASE_URL="[PROJECT_URL_CỦA_SUPABASE]"
    SUPABASE_ANON_KEY="[ANON_PUBLIC_KEY]"
    SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_SECRET_KEY]"

    # JWT Secret (thay đổi chuỗi này)
    JWT_SECRET="chuoi-bi-mat-cuc-ky-phuc-tap-cua-ban"

    # Stripe (tùy chọn)
    STRIPE_SECRET_KEY=...
    STRIPE_WEBHOOK_SECRET=...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

    # Telegram (tùy chọn)
    TELEGRAM_BOT_TOKEN=...
    TELEGRAM_CHAT_ID=...
    ```

4.  **Khởi chạy ứng dụng:**
    -   Mở terminal ở thư mục gốc và chạy lệnh:
    ```bash
    docker-compose up --build
    ```
    -   Docker sẽ bắt đầu build các image và khởi động các container. Quá trình này có thể mất vài phút ở lần chạy đầu tiên.

5.  **Truy cập ứng dụng:**
    -   **Frontend:** Mở trình duyệt và truy cập `http://localhost:3000`
    -   **Backend API Docs:** Truy cập `http://localhost:8000/docs`

### B.3. Sử dụng các chức năng chính

-   **Đăng ký tài khoản:** Truy cập trang chủ và tạo một tài khoản mới.
-   **Nhận diện ảnh:** Đăng nhập, vào trang Dashboard, chọn tab "Image Prediction" và tải lên một ảnh để xem kết quả.
-   **Giám sát thời gian thực:** Vào tab "Live Stream" để xem luồng video từ webcam của bạn được xử lý.
