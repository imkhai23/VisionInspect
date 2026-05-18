'use client';

import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { predictApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Upload, Search, CheckCircle2, AlertTriangle,
  Loader2, X, Shield, Clock, BarChart3,
  ImagePlus, Sparkles
} from 'lucide-react';

export default function InspectPage() {
  const { t, lang } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const translateLabel = (label: string) => {
    if (!label) return '';
    const l = label.toLowerCase().trim();
    if (lang === 'en') {
      const m: any = { good: 'Good', dent: 'Dent', crack: 'Crack', scratch: 'Scratch', missing_part: 'Missing Part', contamination: 'Contamination', normal: 'Normal' };
      return m[l] || label;
    }
    const m: any = { good: 'Đạt chất lượng', dent: 'Vết móp', crack: 'Vết nứt', scratch: 'Vết trầy xước', missing_part: 'Thiếu linh kiện', contamination: 'Bị nhiễm bẩn', normal: 'Bình thường' };
    return m[l] || label;
  };

  const isGood = result?.label === 'normal' || result?.label === 'good';

  // ── Upload helpers ────────────────────────────────────────────────────────
  const handleFileChange = (selected: File | null) => {
    if (!selected) return;
    setFile(selected); setPreview(URL.createObjectURL(selected)); setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    handleFileChange(e.dataTransfer.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await predictApi.predict(file);
      setResult(res.data);
      toast.success(t.analysisComplete);
    } catch {
      toast.error(t.analysisFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null); setPreview(null); setResult(null);
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
            <Sparkles size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">{t.visualInspection}</h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">{t.aiSurfaceDetection}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">

        {/* ── LEFT PANEL ── */}
        <div className="space-y-4">

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-300 cursor-pointer group
              ${dragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/[0.02]'}
              ${preview ? 'aspect-square' : 'aspect-[4/3]'}
            `}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            {preview ? (
              <>
                <img src={preview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full">
                    <ImagePlus size={12} className="text-indigo-400" />
                    <span className="text-[11px] font-bold text-white truncate max-w-[150px]">{file?.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-all">
                    <X size={14} />
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-indigo-500/20 animate-ping opacity-30" />
                  <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all duration-500">
                    <Upload size={36} className="text-indigo-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">📁 {lang === 'vi' ? 'Tải ảnh lên để bắt đầu' : 'Upload image to start'}</h3>
                <p className="text-slate-500 text-sm mb-1">{lang === 'vi' ? 'Kéo & thả ảnh vào đây' : 'Drag & drop image here'}</p>
                <p className="text-slate-600 text-xs mb-5">{lang === 'vi' ? 'hoặc' : 'or'}</p>
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                  🖼️ {lang === 'vi' ? 'Chọn ảnh từ máy tính' : 'Browse from computer'}
                </button>
                <p className="text-slate-700 text-[11px] mt-4">JPG, PNG, WEBP • {lang === 'vi' ? 'Tối đa 10MB' : 'Max 10MB'}</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files?.[0] || null)} hidden accept="image/*" />
          </div>

          {/* ── Analyze button (shared) ── */}

          {preview && (
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full relative overflow-hidden rounded-2xl py-4 font-bold text-lg transition-all duration-300 disabled:opacity-40 group"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-3 text-white">
                {loading
                  ? <><Loader2 size={20} className="animate-spin" /> {t.analyzingBtn}</>
                  : <>🔍 {t.startInspectionBtn}</>
                }
              </span>
            </button>
          )}
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-700 mx-auto mb-5">
                <Search size={36} />
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-2">
                {lang === 'vi' ? 'Kết quả phân tích AI sẽ hiện ở đây' : 'AI analysis results will appear here'}
              </h3>
              <p className="text-slate-600 text-sm max-w-xs mx-auto mb-6">
                {lang === 'vi' ? 'Tải ảnh lên rồi nhấn Bắt đầu Kiểm tra.' : 'Upload an image, then click Start Inspection.'}
              </p>
              <div className="text-left space-y-3 max-w-xs mx-auto">
                {[
                  { step: '1', text: lang === 'vi' ? 'Chọn một ảnh sản phẩm' : 'Choose a product image' },
                  { step: '2', text: lang === 'vi' ? 'Tải ảnh lên từ máy tính' : 'Upload the image from your computer' },
                  { step: '3', text: lang === 'vi' ? 'Nhấn "Bắt đầu Kiểm tra"' : 'Press "Start Inspection"' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[11px] font-black text-indigo-400 shrink-0">{step}</div>
                    <span className="text-xs text-slate-500">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-6 animate-pulse">
              <div className="flex items-center justify-between"><div className="h-7 w-40 bg-white/10 rounded-xl" /><div className="h-7 w-20 bg-white/10 rounded-full" /></div>
              <div className="grid grid-cols-2 gap-4"><div className="h-24 bg-white/10 rounded-2xl" /><div className="h-24 bg-white/10 rounded-2xl" /></div>
              <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-white/10 rounded-xl" />)}</div>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
              <div className={`rounded-3xl p-6 border ${isGood ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {isGood ? <CheckCircle2 size={28} className="text-emerald-400" /> : <AlertTriangle size={28} className="text-red-400" />}
                    <div>
                      <div className={`text-lg font-black ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>{isGood ? t.perfectSurface : t.anomalyDetected}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{isGood ? t.perfectDesc : t.anomalyDesc}</div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${isGood ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                    {translateLabel(result.label)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest"><Shield size={12} /> {t.confidence}</div>
                  <div className="text-3xl font-black text-white">{(result.confidence * 100).toFixed(1)}%</div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${result.confidence * 100}%` }} />
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest"><Clock size={12} /> {t.processingTime}</div>
                  <div className="text-3xl font-black text-white">{result.processing_ms}<span className="text-lg text-slate-500 font-medium">ms</span></div>
                  <div className="text-xs text-slate-600 mt-2">⚡ {lang === 'vi' ? 'Xử lý siêu tốc' : 'Lightning fast'}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={12} /> {t.detailScores}</div>
                <div className="space-y-3">
                  {Object.entries(result.all_scores || {}).sort(([,a]:any,[,b]:any)=>b-a).map(([label, score]: [string, any]) => {
                    const isTop = label === result.label;
                    return (
                      <div key={label} className={`space-y-1.5 p-3 rounded-xl transition-colors ${isTop ? 'bg-white/5' : ''}`}>
                        <div className="flex justify-between text-xs font-bold">
                          <span className={isTop ? 'text-white' : 'text-slate-400'}>{translateLabel(label)}</span>
                          <span className={isTop ? 'text-indigo-400' : 'text-slate-600'}>{(score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${label==='normal'||label==='good'?'bg-gradient-to-r from-emerald-500 to-teal-400':isTop?'bg-gradient-to-r from-indigo-500 to-purple-500':'bg-slate-700'}`} style={{ width: `${score * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
