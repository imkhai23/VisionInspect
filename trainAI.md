# 🎓 Cẩm nang Huấn luyện AI: Cầm tay chỉ việc (1 kèm 1)

Chào bạn! Đừng lo nếu bạn thấy những thuật ngữ như "Epoch" hay "Fine-tuning" khó hiểu. Hãy coi quá trình này giống như việc bạn đang **dạy một đứa trẻ phân biệt các loại đồ vật**.

---

## 🟢 PHẦN 1: CHUẨN BỊ "SÁCH GIÁO KHOA" (DỮ LIỆU)

Để dạy AI, bạn cần hai bộ ảnh (giống như sách giáo khoa):
1.  **Tập TRAIN (Để học):** AI sẽ nhìn vào đây hàng nghìn lần để ghi nhớ đặc điểm lỗi.
2.  **Tập VAL (Để thi):** Sau khi học xong, AI sẽ tự làm bài kiểm tra trên tập này để xem mình có thực sự hiểu bài không.

### 🛠 Thao tác thực tế:
Bạn hãy mở thư mục `ai/data` và làm đúng như sau:
- Copy ít nhất **50 ảnh** đẹp (không lỗi) vào thư mục `train/good`.
- Copy ít nhất **50 ảnh** có vết móp vào thư mục `train/dent`.
- Làm tương tự cho các thư mục khác.
- **Mẹo 1:1:** Đừng dùng ảnh quá giống nhau. Hãy chụp ảnh ở các vị trí khác nhau, ánh sáng khác nhau để AI "thông minh" hơn.

---

## 🟢 PHẦN 2: "MỞ LỚP HỌC" (CÀI ĐẶT MÔI TRƯỜNG)

Hãy tưởng tượng đây là việc bạn chuẩn bị bàn ghế và bảng viết cho lớp học.

### 🛠 Thao tác thực tế:
1.  Nhấn phím `Windows + R`, gõ `cmd` và Enter.
2.  Gõ lệnh: `cd d:\VisionInspect\ai` (để đi vào thư mục AI).
3.  Gõ lệnh: `pip install -r requirements.txt`.
    *   *Giải thích:* Lệnh này giúp tải về "bộ não" trống của AI để chuẩn bị nạp kiến thức.

---

## 🟢 PHẦN 3: "DẠY HỌC" (QUY TRÌNH TRAIN)

Đây là lúc chúng ta cho AI bắt đầu đọc sách.

### 🛠 Thao tác thực tế:
Bạn copy lệnh này và dán vào Terminal:
```bash
python train.py --epochs 30
```

### 🧠 Giải thích kiểu 1:1 (Những gì sẽ hiện ra trên màn hình):
- **Epoch (Vòng đời):** `Epoch 1/30` nghĩa là AI đã đọc xong toàn bộ "sách giáo khoa" 1 lần. Chúng ta cho nó đọc lại 30 lần để nó nhớ thật kỹ.
- **Loss (Lỗi):** Con số này càng nhỏ (ví dụ 0.01) thì AI càng giỏi. Nếu nó to (ví dụ 2.5) là AI đang "học vẹt".
- **Acc (Độ chính xác):** 1.0 nghĩa là 100%. Mục tiêu của chúng ta là con số này trên **0.90**.

**Bật mí:** Ở 5 vòng đầu, AI sẽ học rất chậm (vì tôi đã "khóa" bộ não nó lại để nó chỉ học cái cơ bản). Sau vòng thứ 5, nó sẽ tự "mở khóa" và học cực nhanh các chi tiết nhỏ như vết nứt hay vết xước.

---

## 🟢 PHẦN 4: "THI HỌC KỲ" (KIỂM TRA KẾT QUẢ)

Khi màn hình hiện chữ `[Train] Done!`, chúc mừng bạn đã dạy xong!

### 🛠 Thao tác thực tế:
Bây giờ hãy lấy một cái ảnh mà AI **chưa từng thấy bao giờ** để thử thách nó:
```bash
python inference.py --image test_ngoai.jpg
```
Nó sẽ trả về kết quả: `Vết nứt (98%)`. Nghĩa là nó chắc chắn 98% đây là vết nứt.

---

## 🟢 PHẦN 5: BÍ KÍP ĐỂ AI ĐẠT ĐIỂM 10

Nếu AI nhận diện sai, hãy làm theo "đơn thuốc" sau:
- **Lỗi nhầm lẫn:** Nếu AI nhầm **Vết nứt** thành **Vết xước** -> Hãy thêm 20 cái ảnh Vết nứt thật rõ nét vào thư mục `train/crack`.
- **Lỗi báo sai:** Nếu sản phẩm tốt mà AI bảo lỗi -> Hãy thêm nhiều ảnh `good` (bình thường) vào để nó biết thế nào là đẹp.

---

## 🟢 PHẦN 6: HUẤN LUYỆN MODEL YOLO CHO HỆ THỐNG REALTIME

Vì hệ thống mới của chúng ta chạy **Realtime Detection** (vẽ khung hình và tracking), chúng ta sẽ sử dụng bộ não mạnh mẽ hơn là **YOLOv8** hoặc **YOLOv11**.

### 🛠 Bước 1: Chuẩn bị dữ liệu theo chuẩn YOLO
Khác với phân loại ảnh thông thường, YOLO cần bạn "vẽ khung" quanh sản phẩm lỗi.
1.  Truy cập [Roboflow](https://roboflow.com/) (miễn phí và dễ nhất).
2.  Upload ảnh sản phẩm của bạn lên.
3.  Dùng công cụ vẽ khung (BBox) để đánh dấu:
    -   Vẽ khung quanh sản phẩm và đặt nhãn là `product`.
    -   Nếu thấy lỗi, vẽ khung đè lên chỗ lỗi và đặt nhãn là `defect`.
4.  Chọn **Export** -> Format **YOLOv8**. Bạn sẽ nhận được một file `.zip`.
5.  Giải nén vào thư mục `ai/datasets/factory_data`.

### 🛠 Bước 2: Tạo file cấu hình `data.yaml`
Trong thư mục `ai/datasets/factory_data`, tạo file `data.yaml` với nội dung:
```yaml
path: datasets/factory_data # Đường dẫn tương đối
train: train/images
val: valid/images

names:
  0: product
  1: defect
```

### 🛠 Bước 3: Chạy lệnh Train YOLO
Dán lệnh này vào Terminal:
```bash
python -c "from ultralytics import YOLO; model = YOLO('yolov8n.pt'); model.train(data='datasets/factory_data/data.yaml', epochs=50, imgsz=640)"
```

### 🛠 Bước 4: Sử dụng Model đã train
Sau khi chạy xong, kết quả sẽ nằm trong thư mục `runs/detect/train/weights/best.pt`.
1.  Copy file `best.pt` này vào thư mục `ai/weights/`.
2.  Cập nhật file `backend/app/services/video_service.py`:
    ```python
    # Sửa dòng này để dùng model mới của bạn
    self.engine = VisionEngine(model_path="ai/weights/best.pt")
    ```

### 💡 Mẹo để YOLO cực nhạy:
- **Ảnh Background:** Hãy chụp khoảng 10-20 tấm ảnh **chỉ có dây chuyền trống** (không có sản phẩm) và cho vào tập Train mà không vẽ khung gì cả. Điều này giúp AI bớt báo lỗi "ma".
- **Ánh sáng:** Nếu nhà máy dùng đèn vàng, hãy train bằng ảnh chụp dưới đèn vàng. Nếu đổi sang đèn LED trắng, hãy bổ sung thêm ảnh đèn trắng!

---

## 🚩 TÓM TẮT CÔNG THỨC YOLO:
1. Gán nhãn trên Roboflow -> 2. Tải về format YOLOv8 -> 3. Chạy lệnh `model.train` -> 4. Lấy file `best.pt` dùng cho Dashboard.

*Nếu có chỗ nào bạn vẫn thấy "khựng" lại, hãy chụp màn hình Terminal gửi tôi, tôi sẽ chỉ đích danh bạn cần gõ gì tiếp theo!*
