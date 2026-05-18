import React from 'react';

const content = `
# HƯỚNG DẪN TRAIN AI TRÊN GIAO DIỆN WEB (KHÔNG DÙNG CODE)

Tài liệu này hướng dẫn bạn cách huấn luyện (train) mô hình AI để nhận diện lỗi sản phẩm trực tiếp trên trình duyệt web mà không cần viết một dòng code nào.

---

## BƯỚC 1: CHUẨN BỊ DỮ LIỆU
1. Thu thập ảnh: Chụp khoảng 50-100 ảnh cho mỗi loại lỗi (vết xước, móp méo, nứt, v.v.) và ảnh sản phẩm bình thường.
2. Yêu cầu: Ảnh nên rõ nét, ánh sáng ổn định và ở nhiều góc độ khác nhau.
3. Nén file: Bạn có thể nén tất cả ảnh vào một file .zip để upload nhanh hơn.

---

## BƯỚC 2: TẠO DỰ ÁN DATASET (BỘ DỮ LIỆU)
1. Đăng nhập vào trang Dashboard với tài khoản Admin.
2. Truy cập mục Admin Hub -> Dataset Manager.
3. Tại phần "Tạo dataset project": đặt tên, mô tả, classes (ví dụ: good,scratch,dent,crack).
4. Nhấn nút Tạo Dataset.

---

## BƯỚC 3: UPLOAD ẢNH LÊN HỆ THỐNG
1. Chọn dự án vừa tạo trong danh sách.
2. Ở phần "Upload & Split", kéo thả file ảnh hoặc file .zip, chọn Image/ZIP và mục đích Train/Validation.
3. Nhấn Upload vào Dataset.
4. Sau khi upload xong, nhấn Tính lại split.

---

## BƯỚC 4: BẮT ĐẦU HUẤN LUYỆN (TRAINING)
1. Vào Admin Hub -> AI Training.
2. Chọn dataset, model type (yolov8n hoặc yolov8m), epochs, batch size.
3. Nhấn Start Training.

---

## BƯỚC 5: THEO DÕI VÀ TRIỂN KHAI
1. Hệ thống sẽ đưa yêu cầu vào hàng đợi.
2. Theo dõi Realtime monitor và Training logs.
3. Khi hoàn tất, activate/deploy model mới.

---

### LƯU Ý QUAN TRỌNG
- Chất lượng ảnh ảnh hưởng đến hiệu năng.
- Thời gian train phụ thuộc tài nguyên và dữ liệu.
- Nếu gặp lỗi Network Error, kiểm tra Backend đã chạy chưa.
`;

export default function AdminHelpPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto bg-white rounded-lg shadow">
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
      </div>
    </div>
  );
}
