'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { trainingApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ModelVersion, TrainingJob, TrainingLog } from '@/types';
import {
  ArrowLeft,
  History,
  Loader2,
  Rocket,
  FileDown,
  FileText,
  CircleCheck,
  CircleDashed,
  CircleAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrainingHistoryPage() {
  const { lang } = useLanguage();
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || jobs[0] || null,
    [jobs, selectedJobId],
  );

  const refresh = async () => {
    setLoading(true);
    try {
      const [jobsRes, modelsRes] = await Promise.all([trainingApi.listJobs(), trainingApi.listModels()]);
      const items = (jobsRes.data || []) as TrainingJob[];
      setJobs(items);
      setModels(modelsRes.data || []);
      if (!selectedJobId && items[0]) {
        setSelectedJobId(items[0].id);
      }
    } catch (error) {
      toast.error(lang === 'vi' ? 'Không tải được history' : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (jobId: string) => {
    try {
      const res = await trainingApi.getLogs(jobId);
      setLogs((res.data || []) as TrainingLog[]);
    } catch (error) {
      setLogs([]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchLogs(selectedJobId);
    }
  }, [selectedJobId]);

  const modelForJob = selectedJob ? models.find((model) => model.training_job_id === selectedJob.id) || null : null;

  const downloadWeightsHref = modelForJob?.weights_path?.includes('/storage/')
    ? modelForJob.weights_path.replace(/^[A-Za-z]:\\/i, '/').replace(/\\/g, '/').replace(/^.*\/storage\//, '/storage/')
    : null;

  const deployModel = async () => {
    if (!modelForJob) return;
    try {
      await trainingApi.deployModel(modelForJob.id, { restart_inference: true, activate_only: false });
      toast.success(lang === 'vi' ? 'Đã deploy model' : 'Model deployed');
      refresh();
    } catch (error) {
      toast.error(lang === 'vi' ? 'Deploy thất bại' : 'Deployment failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white mb-3">
            <ArrowLeft size={16} /> {lang === 'vi' ? 'Quay lại Admin Hub' : 'Back to Admin Hub'}
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">{lang === 'vi' ? 'Training History' : 'Training History'}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            {lang === 'vi'
              ? 'Theo dõi các training sessions, trạng thái, duration, metrics và model version đã sinh ra.'
              : 'Track training sessions, status, duration, metrics, and generated model versions.'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-sm font-bold text-slate-400">
          <History size={16} />
          <span>{jobs.length}</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-[0.2em]"><History size={14} /> {lang === 'vi' ? 'Sessions' : 'Sessions'}</div>
          <div className="space-y-3 max-h-[720px] overflow-auto pr-1">
            {loading ? <div className="flex items-center justify-center p-10"><Loader2 className="animate-spin text-indigo-500" size={28} /></div> : jobs.map((job) => {
              const selected = selectedJob?.id === job.id;
              const model = models.find((item) => item.training_job_id === job.id) || null;
              return (
                <button key={job.id} onClick={() => setSelectedJobId(job.id)} className={`w-full text-left rounded-2xl border p-4 transition-all ${selected ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black text-white">{job.model_type} · {job.status}</div>
                      <div className="text-xs text-slate-500 mt-1">{job.dataset_id}</div>
                      <div className="text-xs text-slate-400 mt-2">{job.current_epoch}/{job.total_epochs} · {job.progress.toFixed(1)}%</div>
                    </div>
                    <StatusIcon status={job.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>{new Date(job.created_at).toLocaleString()}</span>
                    <span>{model ? model.version : '—'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <HistoryStat label={lang === 'vi' ? 'Running' : 'Running'} value={jobs.filter((job) => job.status === 'running').length} />
            <HistoryStat label={lang === 'vi' ? 'Completed' : 'Completed'} value={jobs.filter((job) => job.status === 'completed').length} />
            <HistoryStat label={lang === 'vi' ? 'Failed' : 'Failed'} value={jobs.filter((job) => job.status === 'failed').length} />
            <HistoryStat label={lang === 'vi' ? 'Models' : 'Models'} value={models.length} />
          </div>

          <div className="premium-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">{selectedJob?.model_type || '—'}</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedJob ? selectedJob.dataset_id : 'No session selected'}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusClass(selectedJob?.status || 'queued')}`}>
                {selectedJob?.status || 'queued'}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Metric label={lang === 'vi' ? 'Duration' : 'Duration'} value={formatDuration(selectedJob?.started_at, selectedJob?.finished_at)} />
              <Metric label="mAP50" value={selectedJob?.map50 ? selectedJob.map50.toFixed(3) : '—'} />
              <Metric label={lang === 'vi' ? 'Precision' : 'Precision'} value={selectedJob?.precision ? selectedJob.precision.toFixed(3) : '—'} />
              <Metric label={lang === 'vi' ? 'Recall' : 'Recall'} value={selectedJob?.recall ? selectedJob.recall.toFixed(3) : '—'} />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-wrap gap-3 items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500 font-black">{lang === 'vi' ? 'Model version' : 'Model version'}</div>
                <div className="text-sm text-white mt-1">{modelForJob?.name || '—'}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {downloadWeightsHref && (
                  <Link href={downloadWeightsHref} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-black text-slate-300 hover:text-white">
                    <FileDown size={14} /> {lang === 'vi' ? 'Download weights' : 'Download weights'}
                  </Link>
                )}
                {modelForJob && (
                  <button onClick={deployModel} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-500">
                    <Rocket size={14} /> {lang === 'vi' ? 'Deploy model' : 'Deploy model'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-3"><FileText size={14} /> {lang === 'vi' ? 'Training logs' : 'Training logs'}</div>
                <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                  {logs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                        <span>{log.level}</span>
                        <span>{log.epoch ? `E${log.epoch}` : 'LOG'}</span>
                      </div>
                      <div className="mt-2 text-sm text-white leading-relaxed">{log.message}</div>
                    </div>
                  ))}
                  {!logs.length && <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-slate-500">{lang === 'vi' ? 'Chọn session để xem logs.' : 'Select a session to view logs.'}</div>}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-[0.2em]"><CircleCheck /> {lang === 'vi' ? 'Session details' : 'Session details'}</div>
                <DetailRow label="Epochs" value={`${selectedJob?.current_epoch || 0}/${selectedJob?.total_epochs || selectedJob?.epochs || 0}`} />
                <DetailRow label="Loss" value={selectedJob?.train_loss ? selectedJob.train_loss.toFixed(4) : '—'} />
                <DetailRow label="GPU" value={selectedJob?.gpu_usage ? selectedJob.gpu_usage.toFixed(1) : '—'} />
                <DetailRow label="RAM" value={selectedJob?.ram_usage ? selectedJob.ram_usage.toFixed(1) : '—'} />
                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500 font-black">{lang === 'vi' ? 'Error message' : 'Error message'}</div>
                  <div className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">{selectedJob?.error_message || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusClass(status: string) {
  if (status === 'completed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (status === 'running') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  if (status === 'failed') return 'bg-red-500/10 text-red-400 border-red-500/30';
  return 'bg-white/5 text-slate-400 border-white/10';
}

function formatDuration(startedAt: string | null, finishedAt: string | null) {
  if (!startedAt) return '—';
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  const seconds = Math.max(0, Math.round((end - start) / 1000));
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CircleCheck className="text-emerald-400" size={18} />;
  if (status === 'running') return <CircleDashed className="text-indigo-400 animate-spin" size={18} />;
  if (status === 'failed') return <CircleAlert className="text-red-400" size={18} />;
  return <CircleDashed className="text-slate-500" size={18} />;
}

function HistoryStat({ label, value }: any) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500 font-black">{label}</div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function Metric({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500 font-black">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: any) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm">
      <span className="text-slate-500 uppercase tracking-[0.24em] font-black text-[10px]">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}