import sys
import subprocess
import os

try:
    from docx import Document
    from docx.shared import Pt, Cm, RGBColor, Inches
    from docx.enum.text import WD_ALIGN_PARAGRAPH
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx"])
    from docx import Document
    from docx.shared import Pt, Cm, RGBColor, Inches
    from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()
style = doc.styles['Normal']
style.font.name = 'Times New Roman'
style.font.size = Pt(13)
style.paragraph_format.line_spacing = 1.3
style.paragraph_format.space_after = Pt(6)

for section in doc.sections:
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(3.5)
    section.right_margin = Cm(2)

def add_heading(doc, text, level):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.name = 'Times New Roman'
        run.font.color.rgb = RGBColor(0, 0, 0)
        run.bold = True
    return h

# Cover Page
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("TRƯỜNG ĐẠI HỌC ĐÀ LẠT\nKHOA CÔNG NGHỆ THÔNG TIN")
run.bold = True
run.font.size = Pt(15)

doc.add_paragraph("\n\n\n\n\n")

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("TIỂU LUẬN")
run.bold = True
run.font.size = Pt(28)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("Môn học: Các Công Nghệ Mới Trong Phát Triển Phần Mềm")
run.font.size = Pt(15)
run.italic = True

doc.add_paragraph("\n\n\n")

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("ĐỀ TÀI:\n\n")
run.bold = True
run.font.size = Pt(16)
run = p.add_run("HỆ THỐNG KIỂM TRA CHẤT LƯỢNG SẢN PHẨM TRONG NHÀ MÁY BẰNG TRÍ TUỆ NHÂN TẠO")
run.bold = True
run.font.size = Pt(18)

doc.add_paragraph("\n\n\n\n\n")

p = doc.add_paragraph()
p.paragraph_format.left_indent = Inches(3.0)
p.add_run("Giáo viên hướng dẫn: Nguyễn Trọng Hiếu\n").bold = True
p.add_run("Sinh viên thực hiện: Phan Thanh Khải\n").bold = True
p.add_run("MSSV: 2212386").bold = True

doc.add_paragraph("\n\n\n\n\n\n\n\n")
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.add_run("Đà Lạt, 2026").italic = True

doc.add_page_break()

# Content
add_heading(doc, 'TÓM TẮT NỘI DUNG ĐỀ TÀI', 1)

add_heading(doc, '1. Mục tiêu chính của đề tài', 2)
doc.add_paragraph("Trong bối cảnh cách mạng công nghiệp 4.0, việc tự động hóa và đảm bảo chất lượng sản phẩm đầu ra đồng đều là yêu cầu bắt buộc đối với các nhà máy sản xuất. Việc kiểm tra lỗi thủ công bằng mắt thường dễ gây ra sai sót, đặc biệt khi làm việc ở cường độ cao trong thời gian dài. Các phương pháp máy đo quang học truyền thống lại có chi phí đầu tư vô cùng đắt đỏ, cấu hình phức tạp và thiếu sự linh hoạt khi nhà máy thay đổi mẫu mã sản phẩm.")
doc.add_paragraph("Để giải quyết bài toán này, đề tài xây dựng một nền tảng SaaS (Software-as-a-Service) mang tên VisionInspect, giúp mang công nghệ Trí tuệ nhân tạo (AI) vào kiểm tra lỗi bề mặt sản phẩm. Các mục tiêu kỹ thuật cụ thể bao gồm:")
doc.add_paragraph("- Xây dựng pipeline AI thời gian thực: Ứng dụng mô hình YOLOv8 để nhận diện và phân loại lỗi sản phẩm với tốc độ khung hình cao (lên đến 80 FPS).")
doc.add_paragraph("- Ứng dụng Multi-Object Tracking: Tích hợp thuật toán ByteTrack để theo dõi từng sản phẩm qua các frame liên tiếp, giải quyết triệt để bài toán đếm trùng lặp sản phẩm trên băng chuyền.")
doc.add_paragraph("- Giao tiếp truyền phát độ trễ thấp: Xây dựng hệ thống truyền phát (streaming) video qua giao thức MJPEG song song với việc truyền metadata (tọa độ, nhãn, độ tin cậy) qua WebSocket để người quản lý có thể giám sát realtime ngay trên trình duyệt web.")
doc.add_paragraph("- Cảnh báo thông minh (Smart Recording): Hệ thống có khả năng tự động cắt khung hình lỗi, trích xuất đoạn video 6 giây xoay quanh khoảnh khắc xảy ra lỗi và gửi cảnh báo trực tiếp qua Telegram.")
doc.add_paragraph("- Nền tảng tự phục vụ (Self-service Training): Cho phép quản trị viên tự do quản lý dataset, tải lên tập dữ liệu của riêng nhà máy và khởi chạy quá trình huấn luyện lại mô hình AI (re-training) hoàn toàn thông qua giao diện Web.")
doc.add_paragraph("- Đóng gói và triển khai linh hoạt: Toàn bộ hệ thống, từ Frontend, Backend, AI Engine đến Background Workers đều được đóng gói bằng Docker và điều phối qua Docker Compose.")


add_heading(doc, '2. Bảng mô tả ngắn các công nghệ sử dụng', 2)
table = doc.add_table(rows=1, cols=3)
table.style = 'Table Grid'
hdr_cells = table.rows[0].cells
hdr_cells[0].text = 'Thành phần'
hdr_cells[1].text = 'Công nghệ'
hdr_cells[2].text = 'Mục đích'
techs = [
    ('Frontend', 'Next.js 14, TypeScript', 'Xây dựng giao diện người dùng, xử lý App Router, SSR'),
    ('Backend', 'FastAPI, Python', 'Xây dựng REST API, WebSocket, AI Inference bất đồng bộ'),
    ('AI Engine', 'YOLOv8, ByteTrack', 'Phát hiện lỗi và theo dõi đối tượng đa mục tiêu'),
    ('Cơ sở dữ liệu', 'Supabase (PostgreSQL)', 'Xác thực (Auth), lưu trữ dữ liệu (Database) và tệp tin (Storage)'),
    ('Giao tiếp Realtime', 'WebSocket, MJPEG', 'Streaming video liên tục và gửi metadata với độ trễ thấp'),
    ('Hàng đợi (Queue)', 'Redis, RQ', 'Xử lý bất đồng bộ (background jobs) cho các tác vụ huấn luyện AI'),
    ('Triển khai', 'Docker, Docker Compose', 'Đóng gói và triển khai toàn bộ ứng dụng một cách độc lập')
]
for t1, t2, t3 in techs:
    row_cells = table.add_row().cells
    row_cells[0].text = t1
    row_cells[1].text = t2
    row_cells[2].text = t3

doc.add_paragraph("\nViệc lựa chọn các công nghệ trên được tính toán kỹ lưỡng dựa trên đặc thù của bài toán. Next.js 14 với kiến trúc App Router giúp ẩn giấu các API keys ở phía server, bảo mật hệ thống và cung cấp trải nghiệm SPA mượt mà. FastAPI là sự lựa chọn tối ưu ở Backend vì khả năng hỗ trợ bất đồng bộ (async/await) tự nhiên, đặc biệt quan trọng để xử lý nhiều kết nối WebSocket và MJPEG stream cùng lúc mà không làm nghẽn luồng chính. Supabase được chọn thay thế cho Firebase nhờ sức mạnh của cơ sở dữ liệu quan hệ PostgreSQL tích hợp sẵn cơ chế Row Level Security (RLS).")

add_heading(doc, '3. Công cụ AI Agents đã sử dụng để hoàn thành dự án', 2)
doc.add_paragraph("Trong quá trình thực hiện đề tài, các công cụ mô hình ngôn ngữ lớn (LLMs) đã trở thành người trợ lý đắc lực, làm thay đổi đáng kể quy trình phát triển phần mềm truyền thống:")
doc.add_paragraph("- GitHub Copilot (Người trợ lý lập trình): Cung cấp khả năng Code Completion tự động gợi ý cú pháp dựa trên ngữ cảnh của toàn bộ đồ án. Trong môi trường FastAPI hay Next.js, Copilot có thể sinh ra toàn bộ các Pydantic schema hoặc React components lặp đi lặp lại chỉ thông qua các đoạn comment mô tả logic, giúp giảm thiểu đáng kể thời gian gõ code boilerplate. Ngoài ra, Copilot còn giúp giải thích và gỡ lỗi (Debugging) ngay tại IDE.")
doc.add_paragraph("- ChatGPT (Nhà tư vấn kiến trúc): Được sử dụng ở giai đoạn khởi tạo đồ án để so sánh chuyên sâu các công nghệ (Ví dụ: Tại sao nên dùng MJPEG kết hợp WebSocket thay vì dùng WebRTC cho luồng video từ AI). ChatGPT cũng đóng vai trò hỗ trợ phác thảo sơ đồ kiến trúc tổng quan, thiết kế CSDL và rà soát cấu trúc báo cáo đồ án.")
doc.add_paragraph("Đánh giá tác động: Việc tích hợp AI vào quy trình Code đã giúp tiết kiệm ước tính 30-40% thời gian lập trình ở các giai đoạn đầu, đồng thời giảm mạnh rào cản tiếp cận các framework mới, giúp code trở nên sạch sẽ và tuân thủ các best practice.")

add_heading(doc, '4. Bảng phân tích chức năng/module', 2)
doc.add_paragraph("Hệ thống VisionInspect được thiết kế dựa trên triết lý tách biệt mối quan tâm (Separation of Concerns) và tuân theo mô hình 3-tier điển hình, kết hợp kiến trúc Microservices-like cho các tác vụ nền.")
table2 = doc.add_table(rows=1, cols=2)
table2.style = 'Table Grid'
h2 = table2.rows[0].cells
h2[0].text = 'Module / Layer'
h2[1].text = 'Chi tiết chức năng'
modules = [
    ('Client Layer (Frontend)', 'Đảm nhiệm toàn bộ trải nghiệm người dùng UI/UX. Bao gồm các trang: Dashboard tổng quan, trang giám sát Realtime, lịch sử kiểm tra (History), kiểm tra ảnh tĩnh (Inspect) và nền tảng quản trị AI (Admin Platform). Quản lý trạng thái thông qua React Context và Axios Interceptors.'),
    ('API Layer (Backend)', 'Xử lý các business logic, quản lý middleware phân quyền JWT, cung cấp REST API cho frontend tương tác với cơ sở dữ liệu. Cung cấp Lifespan context để khởi tạo và thu dọn an toàn các dịch vụ AI khi khởi động server.'),
    ('AI & Video Layer', 'Chạy độc lập trên một background thread (VideoProcessor) để liên tục lấy frame. VisionEngine thực hiện infer YOLOv8, gọi ByteTrack, crop ảnh khi phát hiện lỗi, và đẩy kết quả vào hàng đợi bộ nhớ. AlertService xử lý đóng gói và gửi qua mạng.'),
    ('Data Layer (Supabase)', 'Quản lý toàn vẹn dữ liệu hệ thống thông qua PostgreSQL, bảo mật quyền truy cập với RLS. Cung cấp API trực tiếp (PostgREST) và dịch vụ lưu trữ (Storage) chứa ảnh dự đoán và file weight mô hình.'),
    ('Queue Layer', 'Hoạt động độc lập với Redis. Một RQ Worker chuyên trách đứng chờ các tín hiệu Job huấn luyện từ Admin. Đảm bảo việc huấn luyện YOLO tốn kém tài nguyên không làm sập server chính.')
]
for m1, m2 in modules:
    row_cells = table2.add_row().cells
    row_cells[0].text = m1
    row_cells[1].text = m2

add_heading(doc, '5. Bảng phân tích CSDL (Supabase)', 2)
doc.add_paragraph("Đề tài tận dụng triệt để sức mạnh của PostgreSQL. Hệ thống CSDL xoay quanh 10 bảng chính, có ràng buộc khóa ngoại chặt chẽ và sử dụng Row Level Security (RLS) để đảm bảo mỗi người dùng chỉ có thể xem/truy vấn dữ liệu thuộc về tài khoản của mình.")
table3 = doc.add_table(rows=1, cols=2)
table3.style = 'Table Grid'
h3 = table3.rows[0].cells
h3[0].text = 'Tên bảng'
h3[1].text = 'Mô tả dữ liệu'
db_tables = [
    ('users', 'Lưu trữ UUID, email, tên hiển thị, trạng thái kích hoạt và cờ phân quyền (is_admin). Đồng bộ với bảng auth.users bằng Database Trigger.'),
    ('predictions', 'Lưu lại toàn bộ lịch sử các lần kiểm tra. Lưu ID người dùng, đường dẫn hình ảnh đã lưu trên Supabase Storage, nhãn (label), điểm số tự tin (confidence) và tốc độ xử lý (ms).'),
    ('subscriptions', 'Phục vụ luồng doanh thu SaaS: Quản lý gói cước (Free/Pro), trạng thái gói và chu kỳ thanh toán, tích hợp trực tiếp với Stripe Billing.'),
    ('usage_logs', 'Log hệ thống: Ghi nhận từng thao tác (action) của người dùng như chạy predict, export data. Dùng để giới hạn số lần kiểm tra của tài khoản Free.'),
    ('datasets', 'Bảng của Admin: Quản lý metadata của các bộ dữ liệu do Admin tải lên (tên, slug, mô tả, danh sách các nhãn classes chuẩn JSON).'),
    ('training_jobs', 'Bảng giao tiếp: Lưu trữ trạng thái tiến trình (queued, running, completed), log quá trình huấn luyện từ Worker, giúp Frontend theo dõi tiến trình qua WebSocket.'),
    ('model_versions', 'Lưu trữ các phiên bản mô hình AI (model artifacts) sau khi training xong, vị trí lưu file .pt, cho phép Admin chuyển đổi phiên bản mô hình đang chạy dễ dàng.')
]
for d1, d2 in db_tables:
    row_cells = table3.add_row().cells
    row_cells[0].text = d1
    row_cells[1].text = d2

add_heading(doc, '6. Bảng mô tả các chức năng đã hoàn thiện', 2)
doc.add_paragraph("Hệ thống hoàn thành đầy đủ một luồng tương tác End-to-End từ nhà vận hành nhà máy đến quản trị viên AI.")
table4 = doc.add_table(rows=1, cols=2)
table4.style = 'Table Grid'
h4 = table4.rows[0].cells
h4[0].text = 'Chức năng'
h4[1].text = 'Mô tả chi tiết'
features = [
    ('Giám sát Realtime', 'Luồng camera được giải mã liên tục, hiển thị trực tiếp trên trình duyệt thông qua thẻ <img>. Dữ liệu bounding box, nhãn và thống kê lỗi (Defect, Good, Total) được gửi qua luồng WebSocket và vẽ đè (overlay) bằng HTML Canvas cực kỳ mượt mà.'),
    ('Kiểm tra tĩnh (Inspect)', 'Hỗ trợ việc tải lên một ảnh mẫu bất kỳ để thử nghiệm mô hình AI, giúp người dùng không có camera vẫn có thể kiểm định chất lượng thuật toán.'),
    ('Lịch sử & Phân tích', 'Lưu trữ hàng ngàn bản ghi kiểm tra, cho phép lọc, tìm kiếm và cung cấp các biểu đồ tròn/cột phân tích phân bố các loại lỗi thường gặp trong tháng.'),
    ('Smart Recording & Telegram', 'Khi mô hình nhận diện ra trạng thái DEFECT, hệ thống lưu lại một đoạn video xung quanh thời điểm đó, cắt lấy khung hình chuẩn xác nhất và gửi tin nhắn đẩy (push notification) kèm ảnh tới ứng dụng Telegram của quản đốc.'),
    ('Nền tảng MLOps thu nhỏ', 'Quản trị viên có thể tải lên file nén .ZIP chứa cấu trúc thư mục YOLO (images/labels). Hệ thống giải nén, sắp xếp, cho phép Admin khởi tạo Job huấn luyện lại mô hình với số epochs tùy chỉnh. Tiến độ huấn luyện (loss, mAP) liên tục được cập nhật lên giao diện web. Quản trị viên có thể thao tác Hot-Swap để thay thế mô hình đang trực chiến.')
]
for f1, f2 in features:
    row_cells = table4.add_row().cells
    row_cells[0].text = f1
    row_cells[1].text = f2

add_heading(doc, '7. Kết luận, tự nhận xét, đánh giá', 2)
doc.add_paragraph("Kết luận:", style='Normal').bold = True
doc.add_paragraph("Đề tài đã hoàn thành xuất sắc mục tiêu xây dựng một nền tảng SaaS ứng dụng Trí tuệ nhân tạo vào lĩnh vực kiểm tra chất lượng sản phẩm công nghiệp (Visual Inspection). Việc kết hợp thành công các công nghệ hiện đại nhất hiện nay như FastAPI, Next.js 14, mô hình YOLOv8, thuật toán ByteTrack và kiến trúc CSDL Supabase đã mang lại một giải pháp phần mềm vừa có tính ứng dụng thực tiễn cao, vừa đáp ứng chặt chẽ yêu cầu khắt khe về tốc độ xử lý thời gian thực.")

doc.add_paragraph("Tự nhận xét & Đánh giá:", style='Normal').bold = True
doc.add_paragraph("- Điểm mạnh:", style='Normal').bold = True
doc.add_paragraph("Hệ thống thể hiện sự tinh tế trong việc thiết kế kiến trúc phần mềm (Architecture Design). Bằng cách tách biệt luồng nhận luồng video (I/O Bound) và luồng suy luận AI (GPU/CPU Bound) vào các thread và hàng đợi (deque) khác nhau, hệ thống tránh được hiện tượng giật lag. Việc tự động hóa hoàn toàn quy trình MLOps trên nền web giúp doanh nghiệp tiết kiệm chi phí thuê chuyên gia AI để bảo trì mô hình. Đóng gói hoàn chỉnh bằng Docker giúp hệ thống có thể triển khai lên bất kỳ máy chủ VPS hoặc điện toán đám mây nào chỉ với một lệnh duy nhất.")

doc.add_paragraph("- Hạn chế:", style='Normal').bold = True
doc.add_paragraph("Mặc dù giải pháp phần mềm tối ưu, tốc độ xử lý (FPS) vẫn phụ thuộc rất nhiều vào cấu hình phần cứng của máy chủ (đặc biệt là GPU NVIDIA). Ở thiết kế hiện tại, hệ thống mới chỉ hỗ trợ xử lý và theo dõi một luồng camera (Single-Camera stream), chưa đáp ứng được các dây chuyền phức tạp cần nhiều góc chụp. Bên cạnh đó, các tệp tin chứa trọng số mô hình (.pt) được lưu trữ trực tiếp trên máy chủ mà chưa có cơ chế mã hóa, dẫn đến rủi ro về bảo mật tài sản trí tuệ nếu bị xâm nhập.")

doc.add_paragraph("- Hướng phát triển trong tương lai:", style='Normal').bold = True
doc.add_paragraph("Trong giai đoạn tiếp theo, kiến trúc của VisionInspect có thể được tái cấu trúc một phần để đưa lớp xử lý VisionEngine chạy cục bộ trên các thiết bị Edge Computing (điện toán biên) như NVIDIA Jetson Nano hoặc Raspberry Pi đặt trực tiếp tại nhà máy, qua đó giải quyết hoàn toàn vấn đề độ trễ truyền dẫn mạng. Hệ thống sẽ được mở rộng để hỗ trợ kiến trúc Multi-Camera. Cuối cùng, việc tích hợp trực tiếp thông qua chuẩn giao tiếp công nghiệp với hệ thống PLC/SCADA để điều khiển cánh tay robot tự động loại bỏ sản phẩm lỗi khỏi băng chuyền sẽ là mảnh ghép cuối cùng biến VisionInspect thành một giải pháp công nghiệp toàn diện.")

output_path = r'd:\VisionInspect\Tieu_Luan_VisionInspect_Extended.docx'
doc.save(output_path)
print(f"Document generated successfully at {output_path}")
