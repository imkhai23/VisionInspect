import React from 'react';

export default function HelpPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto text-slate-900 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-4">Hướng Dẫn Sử Dụng</h1>
      <p className="mb-4">Chào mừng đến với VisionInspect — trang này chứa hướng dẫn sử dụng cơ bản cho người dùng.</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Bắt đầu</h2>
        <ol className="list-decimal list-inside">
          <li>Mở trang <strong>Dashboard</strong>.</li>
          <li>Vào mục <strong>Inspect</strong> để tải ảnh lên và chờ kết quả phân tích AI.</li>
          <li>Với quyền truy cập camera: vào <strong>Realtime</strong> để xem luồng và chụp khung hình.</li>
        </ol>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Lưu ý</h2>
        <ul className="list-disc list-inside">
          <li>Nếu không thấy giao diện đầy đủ, hãy kiểm tra rằng frontend đang chạy và làm mới trình duyệt.</li>
          <li>Nếu camera không hoạt động, kiểm tra quyền truy cập camera của trình duyệt và xem backend có đang phục vụ luồng video hay không.</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Tài liệu thêm</h2>
        <p>Nếu bạn cần huấn luyện mô hình, mục admin có thể cung cấp hướng dẫn chi tiết (yêu cầu quyền admin).</p>
      </section>
    </div>
  );
}
