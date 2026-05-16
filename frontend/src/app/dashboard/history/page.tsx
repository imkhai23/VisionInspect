'use client';

import { useEffect, useState } from 'react';
import { predictApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  History, Calendar, Eye, Loader2, Trash2, X, 
  Shield, Clock, BarChart3, CheckCircle2, AlertTriangle,
  ZoomIn
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const { t, lang } = useLanguage();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null); // For modal

  const translateLabel = (label: string) => {
    if (!label) return '';
    const l = label.toLowerCase().trim();
    if (lang === 'en') {
      const enMap: any = { 'good': 'Good/Quality', 'dent': 'Dent', 'crack': 'Crack', 'scratch': 'Scratch', 'missing_part': 'Missing Part', 'contamination': 'Contamination', 'normal': 'Normal' };
      return enMap[l] || label;
    }
    const viMap: any = { 'good': 'Đạt chất lượng', 'dent': 'Vết móp', 'crack': 'Vết nứt', 'scratch': 'Vết trầy xước', 'missing_part': 'Thiếu linh kiện', 'contamination': 'Bị nhiễm bẩn', 'normal': 'Bình thường' };
    return viMap[l] || label;
  };

  const fetchHistory = async () => {
    try {
      const res = await predictApi.history();
      const data = res.data.items || res.data || [];
      setPredictions(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(lang === 'vi' ? 'Không thể tải lịch sử.' : 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // Close modal on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isGood = (label: string) => label === 'normal' || label === 'good';

  return (
    <>
      {/* ── Main Page ── */}
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">{t.history}</h1>
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
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        ) : predictions.length === 0 ? (
          <div className="premium-card p-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-700 mx-auto mb-6"><History size={40} /></div>
            <h3 className="text-xl font-bold text-slate-400">{lang === 'vi' ? 'Chưa có lịch sử' : 'No history yet'}</h3>
            <p className="text-slate-600 mt-2">{lang === 'vi' ? 'Bạn chưa thực hiện bất kỳ lượt kiểm tra nào.' : 'You have not performed any inspections yet.'}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {predictions.map((p) => (
              <div key={p.id} className="premium-card group overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                {/* Image area */}
                <div className="aspect-video relative overflow-hidden bg-slate-900 flex items-center justify-center">
                  {p.image_url ? (
                    <>
                      <img
                        src={p.image_url}
                        alt="Inspection"
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      {/* Zoom hint on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-bold">
                          <ZoomIn size={16} />
                          {lang === 'vi' ? 'Xem chi tiết' : 'View detail'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-700">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{lang === 'vi' ? 'Không có ảnh' : 'No image'}</span>
                    </div>
                  )}
                  {/* Label badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                    isGood(p.label) ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {translateLabel(p.label)}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} />
                      <span className="text-xs font-bold">{p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-indigo-400">{((p.confidence || 0) * 100).toFixed(1)}%</div>
                      <div className="text-[9px] text-slate-600 uppercase font-bold">{t.confidence}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    {/* Chi tiết button — opens modal */}
                    <button
                      onClick={() => setSelected(p)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[11px] font-bold transition-all"
                    >
                      <Eye size={13} />
                      {lang === 'vi' ? 'Chi tiết & Phóng to' : 'Details & Zoom'}
                    </button>
                    <button className="p-2 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200" />

          {/* Modal content */}
          <div
            className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-auto rounded-3xl bg-slate-900 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
              <X size={20} />
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              {/* LEFT: Full image */}
              <div className="relative bg-black rounded-tl-3xl rounded-bl-3xl overflow-hidden flex items-center justify-center min-h-[400px]">
                {selected.image_url ? (
                  <img
                    src={selected.image_url}
                    alt="Full inspection"
                    className="w-full h-full object-contain max-h-[80vh]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-700 p-12">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                    <span className="text-sm font-bold">{lang === 'vi' ? 'Không có ảnh' : 'No image available'}</span>
                  </div>
                )}
                {/* Label overlay */}
                <div className={`absolute bottom-4 left-4 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border backdrop-blur-md ${
                  isGood(selected.label) ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {translateLabel(selected.label)}
                </div>
              </div>

              {/* RIGHT: Analysis details */}
              <div className="p-8 space-y-6 overflow-auto max-h-[90vh]">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">{t.analysisResult}</h2>
                  <p className="text-slate-500 text-sm flex items-center gap-2">
                    <Calendar size={13} />
                    {selected.created_at ? new Date(selected.created_at).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>

                {/* Status */}
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${isGood(selected.label) ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  {isGood(selected.label)
                    ? <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                    : <AlertTriangle size={22} className="text-red-400 shrink-0" />
                  }
                  <div>
                    <div className={`font-black text-sm ${isGood(selected.label) ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isGood(selected.label) ? t.perfectSurface : t.anomalyDetected}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {isGood(selected.label) ? t.perfectDesc : t.anomalyDesc}
                    </div>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Shield size={11} /> {t.confidence}
                    </div>
                    <div className="text-2xl font-black text-white">{((selected.confidence || 0) * 100).toFixed(1)}%</div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${(selected.confidence || 0) * 100}%` }} />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Clock size={11} /> {t.processingTime}
                    </div>
                    <div className="text-2xl font-black text-white">{selected.processing_ms || 0}<span className="text-base text-slate-500 font-medium">ms</span></div>
                    <div className="text-[10px] text-slate-600">{lang === 'vi' ? 'File: ' : 'File: '}{selected.image_filename}</div>
                  </div>
                </div>

                {/* Scores breakdown */}
                {selected.all_scores && Object.keys(selected.all_scores).length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <BarChart3 size={11} /> {t.detailScores}
                    </div>
                    <div className="space-y-2">
                      {Object.entries(selected.all_scores)
                        .sort(([, a]: any, [, b]: any) => b - a)
                        .map(([label, score]: [string, any]) => {
                          const isTop = label === selected.label;
                          return (
                            <div key={label} className={`space-y-1 p-2.5 rounded-xl ${isTop ? 'bg-white/5' : ''}`}>
                              <div className="flex justify-between text-xs font-bold">
                                <span className={isTop ? 'text-white' : 'text-slate-500'}>{translateLabel(label)}</span>
                                <span className={isTop ? 'text-indigo-400' : 'text-slate-600'}>{(score * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isGood(label) ? 'bg-emerald-500' : isTop ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-700'}`}
                                  style={{ width: `${score * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
