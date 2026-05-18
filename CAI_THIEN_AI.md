# CÁC CÁCH CẢI THIỆN ĐỘ CHÍNH XÁC CỦA AI (VISIONINSPECT)

Nếu AI hiện tại nhận diện chưa tốt, bạn có thể áp dụng các chiến lược sau để nâng cấp "bộ não" của hệ thống:

---

## 1. CẢI THIỆN DỮ LIỆU ĐẦU VÀO (QUAN TRỌNG NHẤT)
AI chỉ giỏi khi nó được học từ dữ liệu tốt. "Rác vào thì rác ra".
- **Tăng số lượng ảnh**: Thay vì 50 ảnh, hãy cố gắng thu thập 200-500 ảnh cho mỗi loại lỗi.
- **Đa dạng hóa góc chụp**: Chụp sản phẩm ở nhiều góc độ, khoảng cách và điều kiện ánh sáng khác nhau.
- **Chụp ảnh thực tế**: Sử dụng chính camera sẽ dùng để chạy hệ thống để chụp ảnh train. Ảnh tải từ mạng thường không giống với thực tế tại nhà máy/xưởng của bạn.
- **Gán nhãn (Labeling) chính xác**: Khi vẽ khung bao quanh lỗi trên web, hãy vẽ sát nhất có thể, không thừa không thiếu.

---

## 2. TỐI ƯU HÓA PHẦN CỨNG CAMERA & ÁNH SÁNG
Đôi khi lỗi không nằm ở AI mà ở hình ảnh camera thu được bị mờ hoặc tối.
- **Ánh sáng ổn định**: Lắp thêm đèn LED tập trung vào vùng sản phẩm đi qua. Tránh đổ bóng hoặc bị lóa sáng.
- **Tiêu cự (Focus)**: Đảm bảo camera lấy nét rõ nhất vào bề mặt sản phẩm.
- **Tốc độ màn trập (Shutter Speed)**: Nếu sản phẩm di chuyển nhanh và bị mờ (motion blur), hãy tăng tốc độ chụp của camera hoặc giảm tốc độ băng chuyền.

---

## 3. THAY ĐỔI CẤU HÌNH KHI TRAIN
Khi bạn nhấn nút **Start Training** trên web, hãy thử thay đổi:
- **Model Type**: Chuyển từ `yolov8n` (Nano - nhẹ nhưng yếu) sang `yolov8s` (Small) hoặc `yolov8m` (Medium). Model lớn hơn sẽ thông minh hơn nhưng cần máy tính mạnh hơn để chạy.
- **Epochs**: Tăng số vòng lặp lên (ví dụ từ 100 lên 300). AI sẽ có nhiều thời gian để "ngẫm nghĩ" hơn.
- **Image Size**: Tăng từ 640 lên 800 hoặc 1024 nếu lỗi sản phẩm rất nhỏ (như vết xước li ti).

---

## 4. TỐI ƯU HÓA THÔNG SỐ NHẬN DIỆN (INFERENCE)
Bạn có thể điều chỉnh cách AI "phán xét" hình ảnh:
- **Confidence Threshold**: Nếu AI nhận diện nhầm quá nhiều, hãy tăng thông số này lên (ví dụ từ 0.5 lên 0.7). AI sẽ chỉ báo lỗi khi nó cực kỳ chắc chắn.
- **IOU Threshold**: Điều chỉnh để tránh việc một lỗi bị vẽ nhiều khung chồng chéo.

---

## 5. SỬ DỤNG KỸ THUẬT AUGMENTATION (TỰ ĐỘNG TĂNG CƯỜNG DỮ LIỆU)
Hệ thống VisionInspect đã tích hợp sẵn tính năng tự động xoay, lật, thay đổi độ sáng của ảnh khi train để giúp AI làm quen với nhiều tình huống. Bạn không cần làm gì ở bước này, hệ thống sẽ tự thực hiện để tối ưu kết quả.

---

### LỜI KHUYÊN:
Hãy bắt đầu bằng việc **chụp thêm 100 tấm ảnh thật nét** của sản phẩm lỗi và train lại với model **YOLOv8s**. Đây thường là cách hiệu quả nhất để thấy sự khác biệt ngay lập tức!
