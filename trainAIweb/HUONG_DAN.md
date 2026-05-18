# HƯỚNG DẪN TRAIN AI TRÊN GIAO DIỆN WEB (KHÔNG DÙNG CODE)

Tài liệu này hướng dẫn bạn cách huấn luyện (train) mô hình AI để nhận diện lỗi sản phẩm trực tiếp trên trình duyệt web mà không cần viết một dòng code nào.

---

## BƯỚC 1: CHUẨN BỊ DỮ LIỆU
Để AI học được, bạn cần cung cấp cho nó các hình ảnh về sản phẩm (cả sản phẩm tốt và sản phẩm lỗi).
1. **Thu thập ảnh**: Chụp khoảng 50-100 ảnh cho mỗi loại lỗi (vết xước, móp méo, nứt, v.v.) và ảnh sản phẩm bình thường.
2. **Yêu cầu**: Ảnh nên rõ nét, ánh sáng ổn định và ở nhiều góc độ khác nhau.
3. **Nén file**: Bạn có thể nén tất cả ảnh vào một file `.zip` để upload nhanh hơn.

---

## BƯỚC 2: TẠO DỰ ÁN DATASET (BỘ DỮ LIỆU)
1. Đăng nhập vào trang Dashboard với tài khoản **Admin**.
2. Truy cập mục **Admin Hub** -> **Dataset Manager**.
3. Tại phần **"Tạo dataset project"**:
   - **Tên dataset**: Nhập tên dự án (VD: "Kiểm tra ốc vít").
   - **Mô tả**: Ghi chú mục đích của bộ dữ liệu này.
   - **Classes**: Nhập danh sách các loại lỗi, cách nhau bằng dấu phẩy (VD: `good,scratch,dent,crack`).
4. Nhấn nút **Tạo Dataset**.

---

## BƯỚC 3: UPLOAD ẢNH LÊN HỆ THỐNG
1. Chọn dự án vừa tạo trong danh sách.
2. Tại phần **"Upload & Split"**:
   - Kéo thả các file ảnh hoặc file `.zip` vào vùng nét đứt.
   - Chọn loại asset là **Image** (hoặc **ZIP** nếu bạn upload file nén).
   - Chọn mục đích là **Train** (cho dữ liệu học) hoặc **Validation** (cho dữ liệu kiểm tra).
3. Nhấn **Upload vào Dataset**.
4. Sau khi upload xong, nhấn **Tính lại split** để hệ thống tự động phân chia dữ liệu cho việc huấn luyện.

---

## BƯỚC 4: BẮT ĐẦU HUẤN LUYỆN (TRAINING)
1. Truy cập mục **Admin Hub** -> **AI Training**.
2. Tại bảng **"Start Training"**:
   - **Chọn dataset**: Chọn dự án bạn vừa upload ảnh.
   - **Model type**: Chọn `yolov8n` (nhanh nhất) hoặc `yolov8m` (chính xác hơn nhưng chậm hơn).
   - **Epochs**: Số vòng lặp huấn luyện (thông thường để 100).
   - **Batch size**: Số lượng ảnh xử lý cùng lúc (thường để 16).
3. Nhấn nút **Start Training**.

---

## BƯỚC 5: THEO DÕI VÀ TRIỂN KHAI
1. Hệ thống sẽ đưa yêu cầu vào hàng đợi (Queue). Khi có máy chủ trống, quá trình train sẽ bắt đầu.
2. Bạn có thể theo dõi biểu đồ **Realtime monitor** và các dòng **Training logs** ngay trên màn hình.
3. Khi quá trình hoàn tất (Status chuyển thành `finished`):
   - Một phiên bản Model mới sẽ được tạo ra.
   - Bạn có thể vào mục **Admin Hub** -> **Models** (nếu có) hoặc xem danh sách Model đã train xong.
   - Nhấn **Activate** hoặc **Deploy** để đưa mô hình này vào sử dụng thực tế cho camera giám sát.

---

### LƯU Ý QUAN TRỌNG:
- **Chất lượng ảnh**: Ảnh càng đa dạng và sát thực tế, AI càng thông minh.
- **Thời gian**: Quá trình train có thể mất từ vài phút đến vài giờ tùy vào số lượng ảnh và cấu hình máy chủ.
- **Hỗ trợ**: Nếu gặp lỗi "Network Error", hãy kiểm tra xem Backend server đã được khởi động chưa.
