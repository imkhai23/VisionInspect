
# Chương 1: Giới Thiệu Tổng Quan

## 1.1. Bối cảnh và tính cấp thiết của đề tài

Cuộc cách mạng công nghiệp 4.0 đang diễn ra mạnh mẽ trên toàn cầu, thúc đẩy quá trình tự động hóa trong mọi lĩnh vực của sản xuất và đời sống. Một trong những thách thức lớn nhất đối với các doanh nghiệp sản xuất là đảm bảo chất lượng sản phẩm đồng đều, giảm thiểu sai sót và tối ưu hóa chi phí. Quy trình kiểm tra chất lượng (Quality Control - QC) thủ công, vốn phụ thuộc nhiều vào con người, thường gặp phải các vấn đề như: thiếu nhất quán, hiệu suất thấp, chi phí nhân công cao và dễ bỏ sót lỗi khi hoạt động trong thời gian dài.

Trong bối cảnh đó, việc ứng dụng Trí tuệ nhân tạo (AI), đặc biệt là Thị giác máy tính (Computer Vision), vào quy trình QC đã trở thành một giải pháp đột phá. Các hệ thống kiểm tra tự động bằng thị giác máy tính có khả năng hoạt động liên tục 24/7 với độ chính xác và ổn định cao, giúp phát hiện sớm các sản phẩm lỗi, từ đó nâng cao chất lượng sản phẩm, tăng năng suất và giảm giá thành.

Tuy nhiên, việc triển khai một hệ thống như vậy không chỉ dừng lại ở việc xây dựng một mô hình AI hiệu quả. Nó đòi hỏi một nền tảng phần mềm hoàn chỉnh, có khả năng quản lý dữ liệu, huấn luyện mô hình, tích hợp vào dây chuyền sản xuất và cung cấp giao diện trực quan cho người vận hành. Đề tài "Xây dựng nền tảng kiểm tra chất lượng sản phẩm bằng thị giác máy tính - VisionInspect" ra đời nhằm giải quyết bài toán toàn diện này, từ việc thu thập dữ liệu đến triển khai và vận hành một hệ thống QC thông minh.

## 1.2. Mô tả bài toán

Bài toán cốt lõi mà dự án VisionInspect giải quyết là tự động phát hiện và phân loại các khuyết tật trên bề mặt sản phẩm (ví dụ: linh kiện điện tử, chi tiết cơ khí) thông qua hình ảnh hoặc video từ camera công nghiệp.

Hệ thống cần giải quyết các yêu cầu cụ thể sau:
- **Phát hiện lỗi thời gian thực:** Hệ thống phải có khả năng phân tích hình ảnh/video từ camera và đưa ra cảnh báo ngay lập tức nếu phát hiện sản phẩm lỗi.
- **Độ chính xác cao:** Mô hình AI phải có khả năng phân biệt chính xác giữa sản phẩm "đạt" (good) và các loại sản phẩm "lỗi" (defect) khác nhau như trầy xước (scratch), nứt (crack), móp (dent), thiếu chi tiết (missing_part)...
- **Khả năng tùy biến:** Người dùng (kỹ sư nhà máy) phải có khả năng tự huấn luyện lại mô hình AI với bộ dữ liệu riêng của họ để phù hợp với các loại sản phẩm và tiêu chuẩn chất lượng khác nhau.
- **Quản lý tập trung:** Cung cấp một giao diện web tập trung để người dùng có thể tải lên dữ liệu, quản lý các phiên huấn luyện, theo dõi hiệu suất mô hình và xem lịch sử các lần phát hiện lỗi.
- **Dễ dàng triển khai:** Hệ thống phải được đóng gói một cách khoa học để có thể dễ dàng triển khai trên các hạ tầng khác nhau, từ máy chủ tại chỗ (on-premise) đến dịch vụ đám mây (cloud).

## 1.3. Mục tiêu của dự án

Dự án đặt ra các mục tiêu chính sau:

1.  **Xây dựng mô hình AI nhận diện khuyết tật:** Nghiên cứu và triển khai mô hình Deep Learning (cụ thể là YOLOv8) để phát hiện và phân loại các loại lỗi sản phẩm với độ chính xác cao.
2.  **Xây dựng nền tảng Web Application:**
    -   Phát triển một ứng dụng web hoàn chỉnh với giao diện người dùng (Frontend) hiện đại, cho phép người dùng đăng ký, đăng nhập, quản lý tài khoản.
    -   Xây dựng hệ thống Backend mạnh mẽ để xử lý các yêu cầu nghiệp vụ, quản lý dữ liệu và tương tác với mô hình AI.
3.  **Tích hợp tính năng giám sát thời gian thực:** Cung cấp khả năng kết nối với camera IP hoặc webcam để phân tích luồng video trực tiếp và hiển thị kết quả nhận diện trên giao diện.
4.  **Xây dựng nền tảng MLOps cơ bản:**
    -   Cho phép người dùng quản lý các bộ dữ liệu (datasets) huấn luyện.
    -   Xây dựng một hệ thống hàng đợi (task queue) để xử lý các tác vụ huấn luyện AI một cách bất đồng bộ, tránh làm tắc nghẽn hệ thống.
    -   Cung cấp giao diện để theo dõi tiến trình và kết quả của các phiên huấn luyện.
5.  **Đóng gói và sẵn sàng triển khai:** Sử dụng Docker và Docker Compose để đóng gói toàn bộ ứng dụng, giúp việc cài đặt và triển khai trở nên đơn giản và nhất quán trên mọi môi trường.

## 1.4. Phạm vi của dự án

- **Trong phạm vi:**
    -   Hệ thống hỗ trợ xác thực người dùng (đăng ký, đăng nhập) và phân quyền cơ bản (user, admin).
    -   Người dùng có thể tải lên ảnh để nhận diện lỗi.
    -   Hệ thống hỗ trợ streaming từ webcam/camera IP để nhận diện lỗi thời gian thực.
    -   Admin có thể quản lý người dùng, datasets, và các phiên huấn luyện model.
    -   Hệ thống cho phép khởi tạo một tác vụ training model YOLOv8 mới dựa trên một dataset đã có.
    -   Toàn bộ hệ thống được đóng gói bằng Docker.

- **Ngoài phạm vi:**
    -   Hệ thống không hỗ trợ các mô hình AI khác ngoài YOLOv8.
    -   Chưa tích hợp các hệ thống thanh toán phức tạp (Stripe chỉ là bản demo).
    -   Chưa xây dựng quy trình CI/CD để tự động hóa hoàn toàn việc triển khai.
    -   Giao diện quản trị MLOps chỉ ở mức cơ bản.

## 1.5. Cấu trúc của báo cáo

Báo cáo được tổ chức thành 6 chương chính:
- **Chương 1 - Giới thiệu tổng quan:** Trình bày lý do chọn đề tài, mục tiêu và phạm vi dự án.
- **Chương 2 - Cơ sở lý thuyết và công nghệ sử dụng:** Giới thiệu các khái niệm và công nghệ nền tảng được áp dụng trong dự án.
- **Chương 3 - Phân tích và thiết kế hệ thống:** Đi sâu vào thiết kế kiến trúc, luồng dữ liệu và cơ sở dữ liệu.
- **Chương 4 - Triển khai xây dựng hệ thống:** Mô tả chi tiết quá trình hiện thực hóa các thành phần của hệ thống.
- **Chương 5 - Đóng gói và triển khai:** Trình bày cách thức đóng gói ứng dụng bằng Docker và quy trình triển khai.
- **Chương 6 - Kết quả, đánh giá và hướng phát triển:** Tổng kết các kết quả đạt được, đánh giá ưu nhược điểm và đề xuất các hướng phát triển trong tương lai.
