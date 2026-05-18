
# Chương 4: Triển Khai Xây Dựng Hệ Thống

Chương này đi sâu vào chi tiết việc hiện thực hóa các thành phần của hệ thống VisionInspect, từ cấu trúc thư mục, mã nguồn Frontend, Backend cho đến hệ thống AI.

## 4.1. Cấu trúc thư mục dự án

Dự án được tổ chức thành các module chính, mỗi module có một vai trò và trách nhiệm rõ ràng, giúp cho việc phát triển và bảo trì trở nên dễ dàng.

```
/
├── ai/                   # Chứa mã nguồn liên quan đến AI/ML
│   ├── train.py          # Script để huấn luyện model
│   ├── inference.py      # Script để thực thi nhận diện
│   ├── model.py          # Định nghĩa kiến trúc model (nếu có tùy chỉnh)
│   └── requirements.txt  # Các thư viện Python cho AI
├── backend/              # Chứa mã nguồn Backend FastAPI
│   ├── app/              # Thư mục ứng dụng chính
│   │   ├── routers/      # Định nghĩa các API endpoints
│   │   ├── services/     # Chứa business logic
│   │   ├── models/       # Định nghĩa các schema dữ liệu (Pydantic)
│   │   ├── workers/      # Chứa code cho các background worker (RQ)
│   │   └── main.py       # Điểm khởi tạo ứng dụng FastAPI
│   ├── Dockerfile        # Dockerfile cho Backend
│   └── requirements.txt  # Các thư viện Python cho Backend
├── frontend/             # Chứa mã nguồn Frontend Next.js
│   ├── src/
│   │   ├── app/          # Cấu trúc App Router của Next.js 13+
│   │   ├── components/   # Các component React tái sử dụng
│   │   ├── lib/          # Các hàm tiện ích, cấu hình API
│   │   └── contexts/     # React Contexts để quản lý state
│   ├── Dockerfile        # Dockerfile cho Frontend
│   └── package.json      # Quản lý các gói npm
├── storage/              # Thư mục lưu trữ dữ liệu (được mount vào container)
│   ├── datasets/         # Chứa các bộ dữ liệu training
│   └── models/           # Chứa các file trọng số model đã huấn luyện
├── docker-compose.yml    # File cấu hình để chạy toàn bộ hệ thống
└── supabase_setup.sql    # Script SQL để thiết lập schema database
```

## 4.2. Triển khai Frontend

Frontend được xây dựng bằng Next.js với App Router, TypeScript và Tailwind CSS, tạo ra một giao diện hiện đại, hiệu suất cao và dễ bảo trì.

### 4.2.1. Xây dựng giao diện và thành phần

- **Kiến trúc App Router:** Cấu trúc thư mục trong `frontend/src/app` ánh xạ trực tiếp đến các đường dẫn URL. Ví dụ, `frontend/src/app/dashboard/page.tsx` sẽ tương ứng với trang `/dashboard`. Kiến trúc này cho phép sử dụng Server Components để tối ưu hóa việc tải trang.
- **Components:** Các thành phần giao diện tái sử dụng như `Button`, `Input`, `LiveView` được đặt trong `frontend/src/components`.
- **Styling:** Tailwind CSS được sử dụng để style các component một cách nhanh chóng. File cấu hình `tailwind.config.js` định nghĩa các theme và tùy chỉnh chung cho toàn bộ dự án.

### 4.2.2. Quản lý trạng thái và tương tác API

- **Quản lý Form:** Thư viện `react-hook-form` kết hợp với `zod` được sử dụng để quản lý trạng thái form và validation dữ liệu phía client một cách hiệu quả, ví dụ như trong các form đăng nhập, đăng ký.
- **Tương tác API:** `axios` được sử dụng để thực hiện các request đến API của Backend. Một instance axios được cấu hình trong `frontend/src/lib/api.ts` để tự động đính kèm token xác thực vào header của mỗi request.
- **Quản lý State toàn cục:** `React Context` (ví dụ: `LanguageContext.tsx`) được sử dụng để chia sẻ các trạng thái chung như thông tin người dùng đã đăng nhập, ngôn ngữ... qua các component khác nhau mà không cần "prop drilling".

### 4.2.3. Tích hợp xác thực với Supabase Auth

Luồng xác thực được xử lý chủ yếu ở phía client để mang lại trải nghiệm người dùng tốt hơn.
- **File `frontend/src/lib/auth.ts`**: Chứa logic để tương tác với Supabase Auth.
- **Đăng nhập/Đăng ký:** Khi người dùng submit form, hàm `signInWithPassword` hoặc `signUp` của `@supabase/supabase-js` được gọi.
- **Quản lý phiên:** Sau khi đăng nhập thành công, Supabase trả về một session chứa JWT. Session này được lưu trữ an toàn trong cookie. `js-cookie` được dùng để quản lý cookie.
- **Middleware:** Next.js middleware có thể được sử dụng để kiểm tra sự tồn tại của session cookie và bảo vệ các trang yêu cầu đăng nhập.

*(Ghi chú: Em nên chèn một vài screenshot các trang giao diện chính như Đăng nhập, Dashboard, trang Upload ảnh vào báo cáo).*

## 4.3. Triển khai Backend

Backend sử dụng FastAPI, cung cấp các API endpoint để Frontend và các service khác có thể tương tác.

### 4.3.1. Xây dựng các API endpoint với FastAPI

- **Cấu trúc Routers:** Mỗi nhóm chức năng được tách ra một file router riêng trong `backend/app/routers` (ví dụ: `auth.py`, `predict.py`, `stream.py`). Điều này giúp mã nguồn trở nên gọn gàng và dễ quản lý.
- **Dependency Injection:** FastAPI có một hệ thống Dependency Injection mạnh mẽ. Ví dụ, một hàm `get_current_user` được định nghĩa để xác thực token JWT và lấy thông tin người dùng. Hàm này sau đó được "inject" vào các endpoint cần bảo vệ.
- **Validation dữ liệu:** Pydantic được sử dụng để định nghĩa các schema dữ liệu (`backend/app/schemas`). FastAPI tự động sử dụng các schema này để validate dữ liệu đầu vào của request và serialize dữ liệu đầu ra, giảm thiểu rất nhiều mã code boilerplate.

**Ví dụ về endpoint `/predict`:**
```python
# trong backend/app/routers/predict.py

@router.post("/predict", response_model=schemas.PredictionResult)
async def predict_image(
    file: UploadFile = File(...),
    model_runtime: ModelRuntime = Depends(get_model_runtime),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 1. Đọc nội dung ảnh từ file upload
    contents = await file.read()
    
    # 2. Thực hiện nhận diện
    results = model_runtime.predict(contents)
    
    # 3. Lưu kết quả vào database
    db_prediction = crud.create_prediction(db, user_id=current_user.id, results=results)
    
    return db_prediction
```

### 4.3.2. Tích hợp với Supabase và xử lý logic nghiệp vụ

- **Tương tác Database:** Logic CRUD (Create, Read, Update, Delete) được tách ra khỏi router và đặt trong các file `crud.py` (không thấy trong cấu trúc nhưng nên có), giúp tái sử dụng và dễ dàng test.
- **Tương tác với Supabase Client:** Một client Supabase (`backend/app/supabase_client.py`) được khởi tạo với `service_role_key`. Key này cho phép backend bỏ qua các quy tắc RLS, thực hiện các tác vụ của admin như quản lý user, cập nhật trạng thái training...

### 4.3.3. Triển khai streaming video với MJPEG

Endpoint `/stream` sử dụng kỹ thuật streaming response của FastAPI để gửi một luồng dữ liệu video.
- **File `backend/app/services/video_service.py`**: Chứa lớp `VideoService` có nhiệm vụ đọc các frame từ camera (sử dụng `opencv-python`), encode chúng thành định dạng JPEG.
- **File `backend/app/routers/stream.py`**:
    - Endpoint trả về một `StreamingResponse`.
    - Response này gọi một hàm generator, hàm này liên tục `yield` (trả về) từng frame ảnh đã được định dạng theo chuẩn MJPEG (Motion JPEG).
    - Trình duyệt sau đó có thể hiển thị luồng này bằng một thẻ `<img>` đơn giản.

## 4.4. Triển khai hệ thống AI và MLOps

Đây là phần cốt lõi và phức tạp nhất của dự án.

### 4.4.1. Module nhận diện (Inference)

- **File `ai/inference.py`**: Chứa hàm `run_inference` nhận đầu vào là một ảnh (dưới dạng mảng numpy) và trả về kết quả nhận diện. Hàm này sử dụng model YOLOv8 đã được tải.
- **File `backend/app/services/model_runtime.py`**:
    - Đây là một lớp Singleton, đảm bảo model AI chỉ được tải vào bộ nhớ một lần duy nhất khi ứng dụng khởi động, tránh việc phải tải lại model cho mỗi request.
    - Nó cung cấp một phương thức `predict()` đơn giản để các phần khác của backend có thể gọi mà không cần biết chi tiết về cách model hoạt động.

### 4.4.2. Module huấn luyện (Training)

Hệ thống training được thiết kế bất đồng bộ để không làm ảnh hưởng đến hiệu năng của ứng dụng chính.
- **File `backend/app/services/training_queue.py`**: Cung cấp hàm `queue_training_job`. Khi được gọi từ API, hàm này sẽ kết nối đến Redis và thêm một job mới vào hàng đợi của RQ. Job này chỉ chứa thông tin định danh (ví dụ: `training_job_id`).
- **File `backend/app/workers/training_worker.py`**:
    - Đây là một script Python độc lập, được chạy như một service riêng trong Docker Compose.
    - Nó khởi tạo một worker của RQ, lắng nghe trên hàng đợi đã định nghĩa.
    - Khi có job mới, worker sẽ gọi hàm xử lý chính (ví dụ: `run_training_task`).
    - **Bên trong `run_training_task`**:
        1. Lấy `training_job_id` từ job.
        2. Truy vấn database (qua Supabase) để lấy thông tin chi tiết về job (dataset nào, hyperparameters gì...).
        3. Cập nhật trạng thái job thành `running`.
        4. Gọi hàm `train.py` từ module `ai` để bắt đầu quá trình training.
        5. Sử dụng callbacks của Ultralytics để cập nhật tiến trình (epoch, loss, mAP...) vào database một cách thường xuyên.
        6. Khi training xong, cập nhật trạng thái `completed` và lưu thông tin model vào bảng `model_versions`.

## 4.5. Tích hợp các tính năng thời gian thực (Real-time)

- **Supabase Realtime:** Frontend sử dụng thư viện `@supabase/supabase-js` để đăng ký lắng nghe các thay đổi trên bảng `training_jobs`.
- **Ví dụ trong Frontend:**
    ```javascript
    // trong trang dashboard training
    useEffect(() => {
        const channel = supabase
            .channel('realtime-jobs')
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'training_jobs' 
            }, (payload) => {
                // Cập nhật lại state của component với dữ liệu mới từ payload.new
                console.log('Job updated!', payload.new);
                // ví dụ: setJobs(currentJobs => update job with payload.new)
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
    ```
- Luồng hoạt động: Khi worker cập nhật một hàng trong bảng `training_jobs`, PostgreSQL sẽ kích hoạt một thông báo. Supabase Realtime bắt lấy thông báo này và đẩy nó qua WebSocket đến tất cả các client đang lắng nghe, giúp giao diện được cập nhật ngay lập tức.
