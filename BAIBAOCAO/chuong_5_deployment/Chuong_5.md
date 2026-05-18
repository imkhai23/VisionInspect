
# Chương 5: Đóng Gói và Triển Khai (Deployment)

Một trong những yêu cầu quan trọng của các hệ thống phần mềm hiện đại là khả năng triển khai (deploy) một cách dễ dàng, nhất quán và có thể lặp lại trên nhiều môi trường khác nhau, từ máy phát triển local đến máy chủ production. Để đạt được điều này, dự án VisionInspect đã áp dụng công nghệ containerization với Docker và Docker Compose.

## 5.1. Giới thiệu về Docker và Containerization

**Containerization** là một hình thức ảo hóa ở cấp độ hệ điều hành. Nó cho phép đóng gói một ứng dụng cùng với tất cả các phụ thuộc của nó (thư viện, file cấu hình, môi trường runtime...) vào một đơn vị độc lập gọi là **container**.

**Docker** là nền tảng containerization phổ biến nhất hiện nay. Nó mang lại các lợi ích chính:
- **Tính nhất quán:** Ứng dụng chạy trong container sẽ hoạt động giống hệt nhau trên mọi máy có cài đặt Docker, giải quyết triệt để vấn đề "nó chạy trên máy tôi mà!".
- **Tính di động:** Container có thể dễ dàng di chuyển và chạy trên bất kỳ môi trường nào (local, on-premise, cloud).
- **Tính cô lập:** Các container chạy độc lập với nhau và với hệ điều hành chủ, tăng cường bảo mật và ổn định.
- **Hiệu quả về tài nguyên:** Container chia sẻ nhân (kernel) của hệ điều hành chủ, do đó nhẹ hơn và khởi động nhanh hơn nhiều so với máy ảo (VM) truyền thống.

## 5.2. Phân tích các tệp `Dockerfile`

Dự án sử dụng hai `Dockerfile` riêng biệt cho hai service chính là Backend và Frontend, áp dụng kỹ thuật **multi-stage build** để tối ưu hóa kích thước image cho môi trường production.

### 5.2.1. `backend/Dockerfile`

```dockerfile
# --- Stage 1: Build stage ---
# Sử dụng image Python đầy đủ để cài đặt các phụ thuộc
FROM python:3.11-slim as builder

WORKDIR /app

# Cài đặt các gói phụ thuộc hệ thống nếu cần
# RUN apt-get update && apt-get install -y ...

# Cài đặt các thư viện Python vào một thư mục riêng
COPY backend/requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt


# --- Stage 2: Final stage ---
# Sử dụng một image Python gọn nhẹ hơn cho production
FROM python:3.11-slim

WORKDIR /app

# Chỉ sao chép các bánh xe đã được build từ stage trước
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Sao chép mã nguồn ứng dụng
COPY ./backend/app /app/app
COPY ./ai /app/ai
COPY ./storage /app/storage

# Cổng mà ứng dụng sẽ lắng nghe
EXPOSE 8000

# Lệnh để chạy ứng dụng khi container khởi động
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Giải thích:**
- **Stage 1 (`builder`):**
    - Bắt đầu từ một image Python (`python:3.11-slim`).
    - Lệnh `pip wheel` được sử dụng để tải và build các thư viện Python thành các file "wheel" (`.whl`). Việc này giúp tăng tốc độ cài đặt ở stage sau và đảm bảo các phụ thuộc đã được biên dịch sẵn.
- **Stage 2 (Final):**
    - Bắt đầu lại từ một image Python `slim` sạch.
    - Sao chép các file wheel đã build từ stage `builder`.
    - Lệnh `pip install` bây giờ sẽ cài đặt từ các file wheel cục bộ, nhanh hơn rất nhiều và không cần kết nối mạng.
    - Sao chép mã nguồn ứng dụng cần thiết vào image.
    - `EXPOSE 8000` để thông báo rằng container này sẽ lắng nghe trên cổng 8000.
    - `CMD` định nghĩa lệnh mặc định để chạy server Uvicorn.

**Lợi ích của Multi-stage build:** Image cuối cùng chỉ chứa môi trường runtime và các thư viện cần thiết, không chứa các công cụ build (như GCC, make...) hay cache của pip, giúp kích thước image giảm đi đáng kể, tăng cường bảo mật và giảm thời gian deploy.

### 5.2.2. `frontend/Dockerfile`

Tương tự, `frontend/Dockerfile` cũng sử dụng multi-stage build để build ứng dụng Next.js.

```dockerfile
# --- Stage 1: Build stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Sao chép package.json và lock file
COPY package*.json ./
# Cài đặt các dependencies
RUN npm install
# Sao chép toàn bộ mã nguồn
COPY . .
# Build ứng dụng cho production
RUN npm run build

# --- Stage 2: Production stage ---
FROM node:18-alpine

WORKDIR /app

# Sao chép các phụ thuộc production từ stage builder
COPY --from=builder /app/node_modules ./node_modules
# Sao chép ứng dụng đã được build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["npm", "start"]
```

## 5.3. Phân tích tệp `docker-compose.yml`

`docker-compose.yml` là file trung tâm, điều phối hoạt động của toàn bộ hệ thống.

```yaml
version: '3.9'

services:
  redis:
    image: redis:7-alpine
    container_name: visioninspect_redis
    restart: unless-stopped
    ports:
      - "6379:6379"

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: visioninspect_backend
    restart: unless-stopped
    environment:
      # ... các biến môi trường ...
      REDIS_URL: redis://redis:6379/0
    ports:
      - "8000:8000"
    depends_on:
      - redis
    volumes:
      - ./storage:/app/storage

  frontend:
    build:
      context: frontend
      dockerfile: Dockerfile
    container_name: visioninspect_frontend
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000 # Giao tiếp qua tên service
    ports:
      - "3000:3000"
    depends_on:
      - backend

  training-worker:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: visioninspect_training_worker
    restart: unless-stopped
    command: ["python", "-m", "app.workers.training_worker"]
    environment:
      # ... các biến môi trường ...
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - redis
      - backend
    volumes:
      - ./storage:/app/storage
```

**Giải thích các thành phần chính:**
- **`services`**: Định nghĩa các container sẽ được tạo, bao gồm `redis`, `backend`, `frontend`, và `training-worker`.
- **`build`**: Chỉ định Docker Compose cách build image cho service (sử dụng `context` là thư mục và `dockerfile` là tên file).
- **`environment`**: Dùng để truyền các biến môi trường vào container. Đây là cách an toàn để quản lý các thông tin nhạy cảm như API keys, URL database mà không cần hardcode trong mã nguồn.
- **`ports`**: Ánh xạ cổng từ máy chủ host vào cổng của container (ví dụ: `3000:3000` ánh xạ cổng 3000 của host vào cổng 3000 của container `frontend`).
- **`depends_on`**: Xác định thứ tự khởi động của các service. Ví dụ, `frontend` phụ thuộc vào `backend`, Docker Compose sẽ đảm bảo `backend` được khởi động trước `frontend`.
- **`volumes`**: Ánh xạ một thư mục từ máy host vào một thư mục trong container (ví dụ: `./storage:/app/storage`). Điều này cho phép dữ liệu (như datasets, models) được lưu trữ bền vững trên máy host, không bị mất đi khi container bị xóa hoặc tạo lại.
- **Giao tiếp nội bộ:** Các container trong cùng một mạng Docker Compose có thể giao tiếp với nhau bằng tên service. Ví dụ, `frontend` có thể gọi `backend` qua URL `http://backend:8000`.

## 5.4. Quy trình triển khai lên máy chủ (VPS)

Với các file Docker đã được chuẩn bị, quy trình triển khai lên một máy chủ ảo (VPS) trở nên rất đơn giản.

### 5.4.1. Sơ đồ kiến trúc triển khai

*(Ghi chú: Em cần vẽ một sơ đồ kiến trúc cho môi trường production và lưu tại `hinh_anh/kien_truc_deployment.png`. Sơ đồ này nên bao gồm các thành phần: Internet, DNS, Cloudflare (tùy chọn), VPS, Reverse Proxy (Nginx), và các Docker container của ứng dụng.)*

### 5.4.2. Các bước cấu hình

1.  **Chuẩn bị VPS:**
    -   Thuê một VPS từ các nhà cung cấp như DigitalOcean, Vultr, Linode... với hệ điều hành Linux (ví dụ: Ubuntu 22.04).
    -   Thực hiện các bước bảo mật cơ bản: tạo người dùng mới (không dùng root), cấu hình SSH key.
2.  **Cài đặt Docker và Docker Compose:**
    -   Cài đặt Docker Engine và Docker Compose plugin trên VPS theo hướng dẫn chính thức.
3.  **Trỏ tên miền:**
    -   Mua một tên miền (ví dụ: `visioninspect.com`).
    -   Trong trang quản lý DNS của nhà cung cấp tên miền, tạo một bản ghi `A` trỏ tên miền chính và một bản ghi `A` cho subdomain `api` (ví dụ: `api.visioninspect.com`) đến địa chỉ IP của VPS.
4.  **Sao chép mã nguồn:**
    -   Sử dụng `git clone` để tải mã nguồn của dự án về VPS.
5.  **Cấu hình Reverse Proxy (Nginx):**
    -   Cài đặt Nginx trên VPS.
    -   Tạo hai file cấu hình server block cho Nginx:
        -   Một file cho `visioninspect.com`: Proxy các request đến `http://localhost:3000` (cổng của container `frontend`).
        -   Một file cho `api.visioninspect.com`: Proxy các request đến `http://localhost:8000` (cổng của container `backend`).
6.  **Cài đặt SSL với Let's Encrypt:**
    -   Sử dụng công cụ `certbot` để tự động lấy và cài đặt chứng chỉ SSL miễn phí từ Let's Encrypt cho cả hai tên miền. `certbot` sẽ tự động sửa đổi file cấu hình Nginx để bật HTTPS và tự động gia hạn chứng chỉ.
7.  **Cấu hình biến môi trường:**
    -   Tạo một file `.env` trong thư mục gốc của dự án trên VPS.
    -   Điền các giá trị cho môi trường production vào file này (URL Supabase, các API keys, `JWT_SECRET` mới, `ALLOWED_ORIGINS` là tên miền của frontend...).
8.  **Khởi chạy ứng dụng:**
    -   Chạy lệnh `docker-compose up -d --build`.
        -   `--build`: Buộc Docker Compose build lại các image.
        -   `-d`: Chạy các container ở chế độ detached (chạy nền).

Sau khi hoàn thành các bước trên, hệ thống VisionInspect sẽ hoạt động hoàn chỉnh trên môi trường production, có thể truy cập qua tên miền với kết nối HTTPS an toàn.
