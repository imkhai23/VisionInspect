'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { predictApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Upload, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  X,
  Zap
} from 'lucide-react';

export default function InspectPage() {
  const { t, lang } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await predictApi.predict(file);
      setResult(res.data);
      toast.success(lang === 'vi' ? 'Phân tích thành công!' : 'Analysis completed!');
    } catch (err) {
      toast.error(lang === 'vi' ? 'Lỗi khi phân tích hình ảnh.' : 'Error analyzing image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">{t.visualInspection}</h1>
          <p className="text-slate-500 font-medium">{t.aiSurfaceDetection}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="premium-card p-2 group">
          <div className="relative aspect-square rounded-[1.8rem] overflow-hidden bg-slate-900/50 border border-white/5 flex flex-col items-center justify-center">
            {preview ? (
              <>
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                <button onClick={() => {setFile(null); setPreview(null); setResult(null);}} className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all">
                  <X size={18} />
                </button>
              </>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center cursor-pointer p-12 text-center">
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t.uploadToStart}</h3>
                <p className="text-slate-500 text-sm max-w-xs">{t.dragDropHint}</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
          </div>
          <div className="p-6">
            <button onClick={handleUpload} disabled={!file || loading} className="btn-premium w-full py-4 text-lg disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
              {loading ? t.analyzing : t.startAnalysis}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {!result && !loading && (
            <div className="premium-card p-10 text-center border-dashed border-white/10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mx-auto mb-6"><Search size={32} /></div>
                <h3 className="text-lg font-bold text-slate-400">{t.noResultYet}</h3>
                <p className="text-slate-600 text-sm mt-2">{t.noResultDesc}</p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="premium-card p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">{t.analysisResult}</h2>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                            result.label === 'normal' || result.label === 'good' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                            {translateLabel(result.label)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.confidence}</div>
                            <div className="text-2xl font-black text-white">{(result.confidence * 100).toFixed(1)}%</div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.processingTime}</div>
                            <div className="text-2xl font-black text-white">{result.processing_ms}ms</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.detailScores}</div>
                        <div className="space-y-3">
                            {Object.entries(result.all_scores || {}).map(([label, score]: [string, any]) => (
                                <div key={label} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-300">{translateLabel(label)}</span>
                                        <span className="text-slate-500">{(score * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${label === 'normal' || label === 'good' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${score * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`p-4 rounded-2xl flex items-start gap-3 ${result.label === 'normal' || result.label === 'good' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {result.label === 'normal' || result.label === 'good' ? <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" /> : <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />}
                        <div>
                            <div className={`text-sm font-bold ${result.label === 'normal' || result.label === 'good' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {result.label === 'normal' || result.label === 'good' ? t.perfectSurface : t.anomalyDetected}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{result.label === 'normal' || result.label === 'good' ? t.perfectDesc : t.anomalyDesc}</p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
