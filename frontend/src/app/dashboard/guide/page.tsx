'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BookOpen, 
  UploadCloud, 
  Search, 
  Activity, 
  ShieldCheck, 
  Database, 
  Zap,
  ArrowRight
} from 'lucide-react';

export default function UserGuidePage() {
  const { lang } = useLanguage();
  const isVi = lang === 'vi';

  const steps = [
    {
      icon: Search,
      title: isVi ? 'Bước 1: Quét Ảnh AI' : 'Step 1: AI Inspection',
      desc: isVi 
        ? 'Chuyển sang mục "Kiểm tra ảnh" (Inspect Image). Tải hình ảnh sản phẩm lên để hệ thống YOLOv8 tự động nhận diện và khoanh vùng các điểm lỗi một cách tức thì.'
        : 'Navigate to "Inspect Image". Upload a product photo to let the YOLOv8 system automatically detect and bound defect areas instantly.',
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Activity,
      title: isVi ? 'Bước 2: Giám Sát Trực Tiếp' : 'Step 2: Real-time Monitor',
      desc: isVi 
        ? 'Mở mục "Giám sát trực tiếp" (Realtime Monitor) để mô phỏng luồng video RTSP thời gian thực trong dây chuyền nhà máy, giúp cảnh báo lỗi ngay khi sản phẩm đi qua băng chuyền.'
        : 'Open "Real-time Monitor" to simulate real-time RTSP video streams in a factory assembly line, providing alerts as soon as defects appear.',
      color: 'from-emerald-400 to-teal-500',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: Database,
      title: isVi ? 'Bước 3: Lịch Sử & Thống Kê' : 'Step 3: History & Analytics',
      desc: isVi 
        ? 'Mọi kết quả quét đều được lưu trữ an toàn trên Supabase Cloud. Tại trang Bảng điều khiển (Dashboard), bạn có thể xem các biểu đồ thống kê trực quan về tỷ lệ lỗi.'
        : 'All inspection results are securely stored on Supabase Cloud. On the Dashboard, you can view intuitive statistical charts of defect rates.',
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: ShieldCheck,
      title: isVi ? 'Bước 4: Quản Trị Hệ Thống' : 'Step 4: System Administration',
      desc: isVi 
        ? 'Nếu bạn là Admin, bạn có quyền truy cập khu vực Quản trị để quản lý Bộ Dữ Liệu (Datasets), kích hoạt các phiên Huấn luyện AI mới và theo dõi nhật ký máy chủ.'
        : 'If you are an Admin, you have access to the Admin Panel to manage Datasets, trigger new AI Training sessions, and monitor server logs.',
      color: 'from-orange-400 to-red-500',
      bg: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/50 to-slate-900 p-8 border border-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <BookOpen size={200} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 mb-6">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {isVi ? 'Hướng Dẫn Sử Dụng' : 'User Guide'}
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            {isVi 
              ? 'Khám phá cách tối ưu hóa quy trình kiểm định chất lượng (QA) trong nhà máy của bạn bằng công nghệ học sâu YOLOv8.' 
              : 'Discover how to optimize your factory quality assurance (QA) workflow using YOLOv8 deep learning technology.'}
          </p>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, index) => (
          <div 
            key={index}
            className="group relative bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${step.color} rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center shadow-inner`}>
                  <step.icon size={28} className={`text-transparent bg-clip-text bg-gradient-to-br ${step.color}`} />
                  {/* Fallback color for icon since bg-clip-text on SVG can be tricky in some browsers */}
                  <step.icon size={28} className="absolute text-white opacity-80 mix-blend-overlay" />
                </div>
                <div className="text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                  0{index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                {step.title}
              </h3>
              
              <p className="text-slate-400 leading-relaxed">
                {step.desc}
              </p>
              
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                {isVi ? 'Bắt đầu ngay' : 'Get started'} <ArrowRight size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Pro Tip */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Zap size={20} className="text-emerald-400" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-emerald-100 mb-1">
            {isVi ? 'Mẹo chuyên gia (Pro Tip)' : 'Pro Tip'}
          </h4>
          <p className="text-emerald-200/70 text-sm">
            {isVi 
              ? 'Tất cả API phân tích hình ảnh đều có thể gọi qua RESTful endpoint. Bạn có thể tích hợp hệ thống VisionInspect này trực tiếp vào cánh tay robot công nghiệp hoặc phần mềm ERP của nhà máy thông qua tài liệu API nội bộ.' 
              : 'All image analysis APIs can be called via RESTful endpoints. You can integrate this VisionInspect system directly into industrial robotic arms or factory ERP software via our internal API documentation.'}
          </p>
        </div>
      </div>
    </div>
  );
}
