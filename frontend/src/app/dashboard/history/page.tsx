'use client';

import { useEffect, useState } from 'react';
import { predictApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  History, 
  Search, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Eye,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const { t, lang } = useLanguage();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Robust translation helper
  const translateLabel = (label: string) => {
    if (!label) return '';
    const l = label.toLowerCase().trim();
    if (lang === 'en') {
        const enMap: any = {
            'good': 'Good/Quality', 'dent': 'Dent', 'crack': 'Crack', 
            'scratch': 'Scratch', 'missing_part': 'Missing Part', 
            'contamination': 'Contamination', 'normal': 'Normal'
        };
        return enMap[l] || label;
    } else {
        const viMap: any = {
            'good': 'Đạt chất lượng', 'dent': 'Vết móp', 'crack': 'Vết nứt', 
            'scratch': 'Vết trầy xước', 'missing_part': 'Thiếu linh kiện', 
            'contamination': 'Bị nhiễm bẩn', 'normal': 'Bình thường'
        };
        return viMap[l] || label;
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await predictApi.history();
      setPredictions(res.data);
    } catch (err) {
      toast.error(lang === 'vi' ? 'Không thể tải lịch sử.' : 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    // Add delete logic if endpoint exists
    toast.success('Deleted successfully');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            {t.history}
          </h1>
          <p className="text-slate-500 font-medium">
            {lang === 'vi' ? 'Danh sách các hình ảnh đã được AI phân tích.' : 'List of images analyzed by AI.'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-sm font-bold text-slate-400">
            <History size={16} />
            <span>{lang === 'vi' ? `Tổng số: ${predictions.length}` : `Total: ${predictions.length}`}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : predictions.length === 0 ? (
        <div className="premium-card p-20 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-700 mx-auto mb-6">
            <History size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-400">{lang === 'vi' ? 'Chưa có lịch sử' : 'No history yet'}</h3>
          <p className="text-slate-600 mt-2">{lang === 'vi' ? 'Bạn chưa thực hiện bất kỳ lượt kiểm tra nào.' : 'You have not performed any inspections yet.'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {predictions.map((p) => (
            <div key={p.id} className="premium-card group overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-slate-900">
                <img 
                    src={p.image_url} 
                    alt="Inspection" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x300/1e293b/94a3b8?text=Image+Missing')}
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                    p.label === 'normal' || p.label === 'good'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                    {translateLabel(p.label)}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-black text-indigo-400">{(p.confidence * 100).toFixed(0)}%</div>
                        <div className="text-[9px] text-slate-600 uppercase font-bold">{t.confidence}</div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <button className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-white transition-colors">
                        <Eye size={14} />
                        {lang === 'vi' ? 'Chi tiết' : 'Details'}
                    </button>
                    <button className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
