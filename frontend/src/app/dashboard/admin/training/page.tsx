'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { datasetApi, trainingApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DatasetProject, ModelVersion, TrainingJob, TrainingLog } from '@/types';
import {
  Activity,
  ArrowLeft,
  Play,
  SquareTerminal,
  Gauge,
  Cpu,
  MemoryStick,
  Timer,
  ChevronRight,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

type LiveMonitor = {
  training_job: TrainingJob;
  recent_logs: TrainingLog[];
};

export default function TrainingPage() {
  const { t } = useLanguage();
  const [datasets, setDatasets] = useState<DatasetProject[]>([]);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [monitor, setMonitor] = useState<LiveMonitor | null>(null);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  const [form, setForm] = useState({
    dataset_id: '',
    model_type: 'yolov8n',
    epochs: 100,
    batch_size: 16,
    image_size: 640,
    learning_rate: 0.001,
    optimizer: 'AdamW',
  });

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || monitor?.training_job || null,
    [jobs, selectedJobId, monitor],
  );

  const refresh = async () => {
    setLoading(true);
    try {
      const [datasetRes, jobsRes, modelsRes] = await Promise.all([
        datasetApi.list(),
        trainingApi.listJobs(),
        trainingApi.listModels(),
      ]);
      const datasetItems = (datasetRes.data || []) as DatasetProject[];
      const jobItems = (jobsRes.data || []) as TrainingJob[];
      setDatasets(datasetItems);
      setJobs(jobItems);
      setModels(modelsRes.data || []);
      setForm((current) => ({ ...current, dataset_id: current.dataset_id || datasetItems[0]?.id || '' }));
      if (!selectedJobId && jobItems[0]) {
        setSelectedJobId(jobItems[0].id);
      }
    } catch (error) {
      toast.error(t.loadTrainingDataError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    wsRef.current?.close();
    if (!selectedJobId) return;

    const socket = new WebSocket(trainingApi.trainingWsUrl(selectedJobId));
    wsRef.current = socket;
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as LiveMonitor;
      setMonitor(payload);
      setJobs((current) => current.map((job) => (job.id === payload.training_job.id ? payload.training_job : job)));
    };
    socket.onerror = () => toast.error(t.monitoringSocketError);

    return () => {
      socket.close();
    };
  }, [selectedJobId]);

  const startTraining = async () => {
    if (!form.dataset_id) {
      toast.error(t.selectDataset);
      return;
    }
    try {
      const response = await trainingApi.createJob(form);
      const job = response.data as TrainingJob;
      toast.success(t.jobQueued);
      setSelectedJobId(job.id);
      refresh();
    } catch (error) {
      toast.error(t.unableStartTraining);
    }
  };

  const chartData = useMemo(
    () =>
      (monitor?.recent_logs || []).map((entry, index) => ({
        step: entry.epoch || index + 1,
        progress: monitor?.training_job.progress || 0,
        epoch: entry.epoch || 0,
      })),
    [monitor],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white mb-3">
            <ArrowLeft size={16} /> {t.backToAdminHub}
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">{t.aiTrainingTitle}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            {t.aiTrainingSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-slate-400">
          <InfoChip icon={<Activity size={14} />} label="Jobs" value={jobs.length} />
          <InfoChip icon={<CheckCircle2 size={14} />} label="Models" value={models.length} />
          <InfoChip icon={<Cpu size={14} />} label={t.datasetsLabel} value={datasets.length} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-[0.2em]"><Play size={14} /> {t.startTrainingLabel}</div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Bộ dữ liệu (Dataset)</label>
              <select value={form.dataset_id} onChange={(e) => setForm((current) => ({ ...current, dataset_id: e.target.value }))} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-indigo-500/50 transition-all outline-none">
                <option value="">{t.selectDataset}</option>
                {datasets.map((dataset) => <option key={dataset.id} value={dataset.id}>{dataset.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Mô hình (Model)</label>
                <select value={form.model_type} onChange={(e) => setForm((current) => ({ ...current, model_type: e.target.value }))} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-indigo-500/50 transition-all outline-none">
                  <option value="yolov8n">YOLOv8n (Siêu nhẹ)</option>
                  <option value="yolov8s">YOLOv8s (Trung bình)</option>
                  <option value="yolov8m">YOLOv8m (Chính xác cao)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Bộ tối ưu (Optimizer)</label>
                <select value={form.optimizer} onChange={(e) => setForm((current) => ({ ...current, optimizer: e.target.value }))} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-indigo-500/50 transition-all outline-none">
                  <option value="AdamW">AdamW (Mặc định)</option>
                  <option value="SGD">SGD</option>
                  <option value="Adam">Adam</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Chu kỳ (Epochs)</label>
                <input type="number" className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-indigo-500/50 transition-all outline-none" value={form.epochs} onChange={(e) => setForm((current) => ({ ...current, epochs: Number(e.target.value) }))} placeholder="Ví dụ: 3, 5, 100" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Kích cỡ lô (Batch Size)</label>
                <input type="number" className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-indigo-500/50 transition-all outline-none" value={form.batch_size} onChange={(e) => setForm((current) => ({ ...current, batch_size: Number(e.target.value) }))} placeholder="Khuyên dùng: 8 hoặc 16" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Kích cỡ ảnh (Image Size)</label>
                <input type="number" className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-indigo-500/50 transition-all outline-none" value={form.image_size} onChange={(e) => setForm((current) => ({ ...current, image_size: Number(e.target.value) }))} placeholder="Mặc định: 640" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Tốc độ học (Learning Rate)</label>
                <input type="number" step="0.0001" className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-indigo-500/50 transition-all outline-none" value={form.learning_rate} onChange={(e) => setForm((current) => ({ ...current, learning_rate: Number(e.target.value) }))} placeholder="Mặc định: 0.001" />
              </div>
            </div>
            <button onClick={startTraining} className="w-full rounded-2xl py-3 font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20">
              {t.startTrainingLabel}
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400 leading-relaxed">
              {t.trainingJobNote}
            </div>
          </div>

          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-[0.2em]"><SquareTerminal size={14} /> {t.recentJobs}</div>
            <div className="space-y-3 max-h-[380px] overflow-auto pr-1">
              {jobs.map((job) => {
                const selected = job.id === selectedJobId;
                return (
                  <button key={job.id} onClick={() => setSelectedJobId(job.id)} className={`w-full text-left rounded-2xl border p-4 transition-all ${selected ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-black text-white">{job.model_type} · {job.status}</div>
                        <div className="text-xs text-slate-500 mt-1">{job.current_epoch}/{job.total_epochs} · {job.progress.toFixed(1)}%</div>
                      </div>
                      <ChevronRight size={16} className="text-slate-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Epoch" value={selectedJob?.current_epoch || 0} subtitle={selectedJob ? `/${selectedJob.total_epochs || selectedJob.epochs}` : '—'} />
            <StatCard title="mAP50" value={selectedJob?.map50 ? selectedJob.map50.toFixed(3) : '—'} subtitle={t.detectionQuality} />
            <StatCard title="Loss" value={selectedJob?.train_loss ? selectedJob.train_loss.toFixed(4) : '—'} subtitle={t.trainingLoss} />
            <StatCard title="ETA" value={selectedJob?.eta_seconds ? `${selectedJob.eta_seconds}s` : '—'} subtitle={t.remainingTime} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="premium-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">{t.realtimeMonitor}</h2>
                  <p className="text-sm text-slate-500">{selectedJob ? `${selectedJob.model_type} · ${selectedJob.status}` : '—'}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedJob?.status === 'running' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                  {selectedJob?.status || '—'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  <span>{t.progress}</span>
                  <span>{selectedJob?.progress?.toFixed(1) || 0}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500" style={{ width: `${selectedJob?.progress || 0}%` }} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Metric icon={<Gauge size={16} />} label={t.precision} value={selectedJob?.precision ? selectedJob.precision.toFixed(3) : '—'} />
                <Metric icon={<Timer size={16} />} label={t.recall} value={selectedJob?.recall ? selectedJob.recall.toFixed(3) : '—'} />
                <Metric icon={<MemoryStick size={16} />} label="GPU/RAM" value={`${selectedJob?.gpu_usage?.toFixed(1) || 0}/${selectedJob?.ram_usage?.toFixed(1) || 0}`} />
              </div>

              <div className="h-[260px] rounded-3xl bg-white/5 border border-white/10 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="step" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: '#fff' }} />
                    <Line type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="premium-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-[0.2em]"><FileText size={14} /> {t.trainingLogs}</div>
              <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                {(monitor?.recent_logs || []).map((log) => (
                  <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                      <span>{log.level}</span>
                      <span>{log.epoch ? `E${log.epoch}` : 'LOG'}</span>
                    </div>
                    <div className="mt-2 text-sm text-white leading-relaxed">{log.message}</div>
                  </div>
                ))}
                {!monitor?.recent_logs?.length && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-slate-500">
                    {t.selectRunningJob}
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                {t.workerNote}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon, label, value }: any) {
  return <div className="px-4 py-2 rounded-xl border border-white/5 bg-white/5 flex items-center gap-2">{icon}<span>{label}: {value}</span></div>;
}

function StatCard({ title, value, subtitle }: any) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500 font-black">{title}</div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
    </div>
  );
}

function Metric({ icon, label, value }: any) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{icon}{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}
