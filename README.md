# 🔍 VisionInspect — AI Product Defect Detection SaaS

A production-ready AI SaaS platform for detecting product defects in images using PyTorch + FastAPI + Next.js.

---

## 📁 Project Structure

```
VisionInspect/
├── ai/                    # PyTorch model & inference
│   ├── model.py           # Model definition & training
│   ├── inference.py       # Inference engine
│   ├── train.py           # Training script
│   └── requirements.txt
│
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── main.py        # FastAPI entry point
│   │   ├── config.py      # Settings & env vars
│   │   ├── database.py    # SQLAlchemy async setup
│   │   ├── models/        # DB models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── routers/       # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Auth & rate limiting
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/              # Next.js 14 frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utils & API client
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── .env.example
│
└── docker-compose.yml     # Full stack orchestration
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (neu chay bang container)
- Node.js 18+
- Python 3.10+
- Supabase project (Postgres + Auth)
- Stripe account

### 1) Clone & Configure

```powershell
git clone <your-repo>
Set-Location VisionInspect
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

### 2) Fill in Environment Variables

**backend/.env**
```env
DATABASE_URL=postgresql+asyncpg://postgres:<db-password>@db.<project-ref>.supabase.co:5432/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
JWT_SECRET=your-super-secret-jwt-key-change-this
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3) Run with Docker (1 lenh)

```powershell
docker compose up --build
```

## ▶️ Chay du an bang Terminal (khong Docker)

Huong dan ben duoi dung cho Windows PowerShell va phu hop voi cau truc repo hien tai.

### B1. Tao/kich hoat Python virtual environment (tai thu muc goc)

```powershell
Set-Location D:\VisionInspect
py -3.11 -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
& .\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

### B2. Chay Backend (terminal 1)

```powershell
Set-Location D:\VisionInspect\backend
& 'D:\VisionInspect\.venv\Scripts\uvicorn.exe' app.main:app --reload --port 8000
```

Backend docs: `http://localhost:8000/docs`

### B3. Chay Frontend (terminal 2)

```powershell
Set-Location D:\VisionInspect\frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

### B4. Kiem tra nhanh cac cong

```powershell
Test-NetConnection localhost -Port 8000 | Select-Object ComputerName,RemotePort,TcpTestSucceeded
Test-NetConnection localhost -Port 3000 | Select-Object ComputerName,RemotePort,TcpTestSucceeded
```

Neu ket noi Supabase bi loi, kiem tra lai `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` trong `backend/.env`.

---

## 🌐 Deployment

| Service    | Platform  | Notes                          |
|------------|-----------|--------------------------------|
| Frontend   | Vercel    | Connect GitHub repo            |
| Backend    | Render    | Use `Dockerfile` in `/backend` |
| Database   | Supabase  | Free PostgreSQL + auth         |

### Deploy to Vercel
```bash
cd frontend
npx vercel --prod
```

### Deploy Backend to Render
1. Create new Web Service on Render
2. Point to `backend/` directory
3. Set environment variables
4. Deploy

---

## 📊 API Endpoints

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | /auth/register        | ❌   | Create account           |
| POST   | /auth/login           | ❌   | Get JWT token            |
| GET    | /auth/me              | ✅   | Get current user         |
| POST   | /predict              | ✅   | Upload image & predict   |
| GET    | /history              | ✅   | Get prediction history   |
| GET    | /usage                | ✅   | Get usage stats          |
| POST   | /stripe/webhook       | ❌   | Stripe events            |
| POST   | /stripe/subscribe     | ✅   | Create subscription      |

---

## 💳 Plans

| Feature         | Free    | Pro ($29/mo) |
|-----------------|---------|--------------|
| Predictions/mo  | 50      | Unlimited    |
| History         | 7 days  | 90 days      |
| API Access      | ❌      | ✅           |
| Priority Queue  | ❌      | ✅           |

---

## 🤖 AI Model & Training Guide

Hệ thống sử dụng mô hình **ResNet-50** đã được tinh chỉnh (fine-tuned) để nhận diện lỗi sản phẩm.

### 1. Chuẩn bị dữ liệu (Data Preparation)
Dữ liệu phải được chia thành hai phần riêng biệt trong thư mục `ai/data/`:

```text
ai/data/
├── train/               # Dữ liệu để AI học (80%)
│   ├── good/            # Ảnh sản phẩm đạt chuẩn
│   ├── scratch/         # Ảnh bị trầy xước
│   └── ...              # Các thư mục lỗi khác
└── val/                 # Dữ liệu để AI tự kiểm tra (20%)
    ├── good/            # Ảnh sản phẩm đạt chuẩn (KHÔNG trùng với train)
    ├── scratch/         # Ảnh bị trầy xước (KHÔNG trùng với train)
    └── ...
```

### 2. Tại sao Train và Val phải khác nhau? (Ví dụ dễ hiểu)

Hãy coi AI là một học sinh và việc huấn luyện là việc ôn thi:
*   **Thư mục `train`**: Là **Sách bài tập**. AI được xem cả đề bài và đáp án để học quy luật.
*   **Thư mục `val`**: Là **Đề thi thật**. AI chỉ được xem đề bài và phải tự đưa ra đáp án.

| Đặc điểm | Thư mục `train` | Thư mục `val` |
| :--- | :--- | :--- |
| **Mục đích** | Để AI học đặc điểm lỗi. | Để kiểm tra xem AI có hiểu bài thật không. |
| **AI có biết đáp án?** | Có (được học từ nhãn thư mục). | Không (AI phải tự đoán, sau đó hệ thống mới so sánh). |
| **Hệ quả nếu trùng** | AI sẽ **học thuộc lòng** từng bức ảnh. | Accuracy sẽ rất cao (100%) nhưng ra thực tế sẽ **ngu ngơ**. |

**✅ Cách làm đúng:** Nếu bạn có 100 tấm ảnh lỗi, hãy lấy 80 tấm cho vào `train` và 20 tấm **hoàn toàn khác** cho vào `val`. AI cần được thử thách bằng những thứ "chưa thấy bao giờ" để trở nên thông minh hơn.

### 3. Quy tắc vàng khi chuẩn bị ảnh (Best Practices)
*   **Đa dạng:** Chụp ảnh ở nhiều điều kiện khác nhau: góc chụp nghiêng/thẳng, ánh sáng mạnh/yếu, nền sạch/bẩn.
*   **Kích thước:** AI sẽ tự động đưa về 224x224. Đảm bảo vật thể lỗi nằm rõ trong khung hình.

### 3. Lệnh huấn luyện
Mở terminal và chạy lệnh:
```bash
cd ai
pip install -r requirements.txt
python train.py --data_dir ./data --epochs 30 --batch_size 16
```
*   `--epochs`: AI sẽ học đi học lại bao nhiêu lần (nên để 30-50).
*   `--batch_size`: Số lượng ảnh AI xử lý mỗi lần (giảm xuống 4 hoặc 8 nếu máy báo lỗi hết bộ nhớ GPU).
*   Sau khi hoàn tất, tệp mô hình tốt nhất sẽ được lưu tại `ai/weights/defect_classifier.pth`.

---

## 🛠 Tech Stack
- **AI:** PyTorch (ResNet-50)
- **Backend:** FastAPI, PostgreSQL, SQLAlchemy (Async)
- **Frontend:** Next.js 14, Tailwind/Custom CSS
- **Payments:** Stripe API
- **Deployment:** Docker, Render, Vercel
