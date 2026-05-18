
# Chương 2: Cơ Sở Lý Thuyết và Công Nghệ Sử Dụng

Chương này trình bày tổng quan về các nền tảng lý thuyết và các công nghệ phần mềm hiện đại đã được lựa chọn và áp dụng để xây dựng hệ thống VisionInspect.

## 2.1. Tổng quan về Thị giác máy tính và Deep Learning

**Thị giác máy tính (Computer Vision)** là một lĩnh vực của trí tuệ nhân tạo cho phép máy tính "nhìn" và diễn giải thế giới hình ảnh kỹ thuật số. Mục tiêu của nó là tự động hóa các tác vụ mà hệ thống thị giác của con người có thể làm. Các bài toán phổ biến trong thị giác máy tính bao gồm:
- **Phân loại ảnh (Image Classification):** Gán một nhãn cho toàn bộ bức ảnh (ví dụ: "chó", "mèo").
- **Phát hiện vật thể (Object Detection):** Xác định vị trí (bằng bounding box) và phân loại các đối tượng trong ảnh.
- **Phân đoạn ảnh (Image Segmentation):** Phân loại từng pixel trong ảnh thuộc về đối tượng nào.

**Deep Learning (Học sâu)** là một nhánh của Học máy (Machine Learning) dựa trên các mạng nơ-ron nhân tạo với nhiều lớp (layer). Sự ra đời của các mô hình Deep Learning, đặc biệt là Mạng nơ-ron tích chập (Convolutional Neural Networks - CNN), đã tạo ra một cuộc cách mạng trong lĩnh vực thị giác máy tính, mang lại độ chính xác vượt trội so với các phương pháp truyền thống.

Trong dự án này, bài toán phát hiện khuyết tật sản phẩm được giải quyết bằng phương pháp **Phát hiện vật thể**, nơi mỗi loại khuyết tật được xem là một "vật thể" cần được khoanh vùng và định danh.

## 2.2. Giới thiệu mô hình YOLO và phiên bản YOLOv8

**YOLO (You Only Look Once)** là một họ các mô hình phát hiện vật thể nổi tiếng với tốc độ xử lý cực nhanh, phù hợp cho các ứng dụng thời gian thực. Khác với các kiến trúc hai giai đoạn (two-stage) như R-CNN, YOLO xử lý toàn bộ bức ảnh chỉ trong một lần duy nhất, đồng thời dự đoán tất cả các bounding box và xác suất của các lớp.

**YOLOv8**, được phát triển bởi Ultralytics, là phiên bản mới nhất và mạnh mẽ nhất trong họ YOLO tại thời điểm phát triển dự án. Các ưu điểm chính của YOLOv8 bao gồm:
- **Hiệu suất cao:** Đạt được sự cân bằng tuyệt vời giữa tốc độ và độ chính xác.
- **Kiến trúc linh hoạt:** Dễ dàng tùy chỉnh và thay đổi, không còn phụ thuộc vào các "anchor box" cố định như các phiên bản trước.
- **Dễ sử dụng:** Ultralytics cung cấp một bộ công cụ (framework) hoàn chỉnh để training, validating, và deploy mô hình một cách thuận tiện.
- **Hỗ trợ đa tác vụ:** Ngoài phát hiện vật thể, YOLOv8 còn hỗ trợ các tác vụ khác như phân đoạn ảnh và phân loại ảnh.

Với những ưu điểm trên, YOLOv8 là lựa chọn lý tưởng cho bài toán nhận diện khuyết tật sản phẩm trong thời gian thực của dự án.

## 2.3. Phân tích các công nghệ Frontend

Giao diện người dùng của VisionInspect được xây dựng dựa trên một hệ sinh thái JavaScript hiện đại.

### 2.3.1. Next.js và kiến trúc App Router

**Next.js** là một React framework mã nguồn mở, cung cấp các công cụ và tính năng tối ưu để xây dựng các ứng dụng web hiệu suất cao.
- **Kiến trúc App Router (từ Next.js 13):** Đây là một bước tiến lớn so với Pages Router truyền thống. App Router cho phép sử dụng **React Server Components (RSC)**, giúp giảm lượng JavaScript cần gửi xuống client, cải thiện tốc độ tải trang và SEO. Nó cũng cung cấp một hệ thống layout lồng nhau mạnh mẽ, giúp quản lý giao diện phức tạp một cách dễ dàng.
- **Vai trò trong dự án:** Next.js được sử dụng để xây dựng toàn bộ giao diện người dùng, từ các trang tĩnh giới thiệu đến trang dashboard tương tác phức tạp, đảm bảo trải nghiệm người dùng mượt mà và hiệu suất tối ưu.

### 2.3.2. TypeScript

**TypeScript** là một ngôn ngữ lập trình mã nguồn mở được phát triển bởi Microsoft. Nó là một tập hợp cha (superset) của JavaScript, bổ sung thêm hệ thống kiểu tĩnh (static types).
- **Vai trò trong dự án:** Việc sử dụng TypeScript trong toàn bộ codebase frontend (`frontend/tsconfig.json`) giúp:
    - Phát hiện lỗi sớm ngay trong quá trình phát triển.
    - Tăng cường khả năng đọc hiểu và bảo trì code.
    - Cải thiện trải nghiệm lập trình với tính năng tự động hoàn thành (autocomplete) và gợi ý thông minh từ IDE.

### 2.3.3. Tailwind CSS

**Tailwind CSS** là một framework CSS theo phương pháp "utility-first". Thay vì cung cấp các component dựng sẵn, nó cung cấp các lớp CSS nguyên tử (utility classes) cho phép xây dựng giao diện tùy chỉnh một cách nhanh chóng trực tiếp trong mã HTML/JSX.
- **Vai trò trong dự án:** Tailwind CSS giúp tăng tốc độ phát triển giao diện, đảm bảo tính nhất quán trong thiết kế và dễ dàng tạo ra các giao diện đáp ứng (responsive) cho nhiều kích thước màn hình.

## 2.4. Phân tích các công nghệ Backend

Backend của hệ thống được xây dựng bằng Python, ngôn ngữ hàng đầu trong lĩnh vực khoa học dữ liệu và AI.

### 2.4.1. Ngôn ngữ Python và Framework FastAPI

**FastAPI** là một web framework hiện đại, hiệu suất cao để xây dựng các API với Python 3.7+, dựa trên các gợi ý kiểu (type hints) tiêu chuẩn của Python.
- **Hiệu suất cao:** FastAPI được xây dựng trên Starlette (cho phần web) và Pydantic (cho phần dữ liệu), mang lại hiệu suất ngang ngửa với NodeJS và Go.
- **Lập trình bất đồng bộ:** Hỗ trợ `async/await` một cách tự nhiên, rất lý tưởng cho các tác vụ I/O-bound như truy vấn database, gọi API bên ngoài, và đặc biệt là xử lý streaming.
- **Tự động sinh tài liệu:** Tự động tạo ra tài liệu API tương tác (sử dụng Swagger UI và ReDoc), giúp việc kiểm thử và tích hợp trở nên cực kỳ dễ dàng.
- **Vai trò trong dự án:** FastAPI được dùng để xây dựng toàn bộ các API endpoint, xử lý logic nghiệp vụ, xác thực người dùng và giao tiếp với mô hình AI.

### 2.4.2. Kỹ thuật xử lý bất đồng bộ (Asynchronous)

Lập trình bất đồng bộ cho phép một chương trình thực hiện các tác vụ khác trong khi chờ đợi một tác vụ tốn thời gian (như đọc file, truy vấn mạng) hoàn thành.
- **Vai trò trong dự án:** Kỹ thuật này được áp dụng triệt để trong FastAPI, đặc biệt quan trọng đối với:
    - **Endpoint streaming (`/stream`):** Cho phép gửi các frame hình ảnh liên tục đến client mà không block tiến trình của server.
    - **Endpoint nhận diện (`/predict`):** Trong khi mô hình AI đang xử lý ảnh, server có thể tiếp nhận các request khác.

## 2.5. Nền tảng Backend-as-a-Service (BaaS): Supabase

**Supabase** là một nền tảng mã nguồn mở thay thế cho Firebase. Nó cung cấp một bộ công cụ backend hoàn chỉnh dựa trên PostgreSQL.
- **Vai trò trong dự án:** Supabase đóng vai trò là xương sống cho việc quản lý dữ liệu và xác thực:
    - **Supabase Database:** Một cơ sở dữ liệu PostgreSQL đầy đủ, cho phép thiết kế schema phức tạp và thực hiện các truy vấn mạnh mẽ.
    - **Supabase Auth:** Cung cấp hệ thống xác thực người dùng hoàn chỉnh, bao gồm đăng ký, đăng nhập, quản lý phiên, và tích hợp với các nhà cung cấp thứ ba.
    - **Supabase Storage:** Dùng để lưu trữ các tệp tin như ảnh sản phẩm do người dùng tải lên.
    - **Supabase Realtime:** Cho phép lắng nghe các thay đổi trong database (INSERT, UPDATE, DELETE) và đẩy thông tin cập nhật về client theo thời gian thực. Tính năng này cực kỳ hữu ích để cập nhật tiến trình training model trên dashboard.
    - **Row Level Security (RLS):** Một tính năng mạnh mẽ của PostgreSQL cho phép định nghĩa các chính sách bảo mật ở cấp độ hàng dữ liệu, đảm bảo người dùng chỉ có thể truy cập vào dữ liệu của chính họ.

## 2.6. Công nghệ Containerization: Docker và Docker Compose

**Docker** là một nền tảng cho phép phát triển, vận chuyển và chạy các ứng dụng trong các "container". Container đóng gói ứng dụng và tất cả các phụ thuộc của nó thành một đơn vị duy nhất, đảm bảo ứng dụng chạy nhất quán trên mọi môi trường.

**Docker Compose** là một công cụ để định nghĩa và chạy các ứng dụng Docker đa container. Nó sử dụng một tệp YAML để cấu hình các dịch vụ của ứng dụng, sau đó tạo và khởi động tất cả các dịch vụ từ cấu hình đó bằng một lệnh duy nhất.
- **Vai trò trong dự án:**
    - **Dockerfile:** Mỗi service (frontend, backend) có một `Dockerfile` riêng để định nghĩa cách build image cho service đó.
    - **docker-compose.yml:** Tệp này đóng vai trò "nhạc trưởng", định nghĩa cách các service (`frontend`, `backend`, `redis`, `training-worker`) liên kết và giao tiếp với nhau, quản lý network, volumes và biến môi trường.

## 2.7. Hàng đợi tác vụ (Task Queue): Redis và RQ

Khi một tác vụ tốn nhiều thời gian để thực hiện (như training một mô hình AI), việc xử lý nó trực tiếp trong một request web sẽ làm người dùng phải chờ đợi rất lâu và có thể gây timeout. Hàng đợi tác vụ được sinh ra để giải quyết vấn đề này.

- **Redis:** Là một kho lưu trữ cấu trúc dữ liệu trong bộ nhớ, thường được sử dụng làm database, cache và message broker. Trong dự án này, Redis đóng vai trò là "message broker" - nơi lưu trữ các tác vụ đang chờ được xử lý.
- **RQ (Redis Queue):** Là một thư viện Python đơn giản để đưa các công việc vào hàng đợi và xử lý chúng một cách bất đồng bộ với các "worker".
- **Vai trò trong dự án:**
    - Khi người dùng yêu cầu training một model mới, API backend sẽ không thực hiện ngay. Thay vào đó, nó tạo một "job" và đẩy vào hàng đợi trong Redis (`training_queue.py`).
    - Một tiến trình riêng biệt, gọi là **worker** (`training_worker.py`), sẽ liên tục theo dõi hàng đợi này. Khi có job mới, worker sẽ lấy ra và thực hiện tác vụ training.
    - Kiến trúc này giúp hệ thống có khả năng mở rộng và phản hồi nhanh chóng, không bị block bởi các tác vụ nặng.
