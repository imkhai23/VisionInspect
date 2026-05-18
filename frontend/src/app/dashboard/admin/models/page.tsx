'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trainingApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ModelVersion } from '@/types';
import {
  ArrowLeft,
  Layers3,
  CheckCircle2,
  RotateCcw,
  Rocket,
  Trash2,
  BadgeInfo,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ModelRegistryPage() {
  const { lang } = useLanguage();
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await trainingApi.listModels();
      setModels((res.data || []) as ModelVersion[]);
    } catch (error) {
      toast.error(lang === 'vi' ? 'Không tải được model versions' : 'Failed to load model versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const activate = async (model: ModelVersion) => {
    try {
      await trainingApi.activateModel(model.id);
      toast.success(lang === 'vi' ? 'Đã kích hoạt model' : 'Model activated');
      refresh();
    } catch (error) {
      toast.error(lang === 'vi' ? 'Kích hoạt thất bại' : 'Activation failed');
    }
  };

  const deploy = async (model: ModelVersion) => {
    try {
      await trainingApi.deployModel(model.id, { restart_inference: true, activate_only: false });
      toast.success(lang === 'vi' ? 'Đã deploy model' : 'Model deployed');
      refresh();
    } catch (error) {
      toast.error(lang === 'vi' ? 'Deploy thất bại' : 'Deployment failed');
    }
  };

  const rollback = async (model: ModelVersion) => {
    if (!window.confirm(lang === 'vi' ? 'Rollback về version này?' : 'Rollback to this version?')) return;
    try {
      await trainingApi.rollbackModel(model.id);
      toast.success(lang === 'vi' ? 'Đã rollback model' : 'Model rolled back');
      refresh();
    } catch (error) {
      toast.error(lang === 'vi' ? 'Rollback thất bại' : 'Rollback failed');
    }
  };

  const remove = async (model: ModelVersion) => {
    if (!window.confirm(lang === 'vi' ? 'Xóa model version này?' : 'Delete this model version?')) return;
    try {
      await trainingApi.removeModel(model.id);
      toast.success(lang === 'vi' ? 'Đã xóa model' : 'Model deleted');
      refresh();
    } catch (error) {
      toast.error(lang === 'vi' ? 'Xóa thất bại' : 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white mb-3">
            <ArrowLeft size={16} /> {lang === 'vi' ? 'Quay lại Admin Hub' : 'Back to Admin Hub'}
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">{lang === 'vi' ? 'Model Registry' : 'Model Registry'}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            {lang === 'vi'
              ? 'Quản lý version model, activate, deploy và rollback an toàn cho realtime inference.'
              : 'Manage model versions, activate, deploy, and rollback safely for realtime inference.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-slate-400">
          <InfoChip icon={<Layers3 size={14} />} label="Versions" value={models.length} />
          <InfoChip icon={<CheckCircle2 size={14} />} label="Active" value={models.filter((model) => model.is_active).length} />
        </div>
      </div>

      {loading ? (
        <div className="premium-card p-10 text-center text-slate-500">{lang === 'vi' ? 'Đang tải...' : 'Loading...'}</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {models.map((model) => (
            <div key={model.id} className="premium-card p-6 space-y-5 border border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-white font-black text-xl">
                    <BadgeInfo size={18} className="text-indigo-400" />
                    {model.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-[0.2em] font-black">{model.version} · {model.model_type}</div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${model.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                  {model.is_active ? 'ACTIVE' : 'IDLE'}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Stat label="mAP50" value={formatMetric(model.metrics, 'map50', 'metrics/mAP50(B)')} />
                <Stat label="Precision" value={formatMetric(model.metrics, 'precision', 'metrics/precision(B)')} />
                <Stat label="Recall" value={formatMetric(model.metrics, 'recall', 'metrics/recall(B)')} />
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-slate-400 break-all">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-black mb-2">Weights path</div>
                {model.weights_path}
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton label={lang === 'vi' ? 'Activate' : 'Activate'} icon={<CheckCircle2 size={14} />} onClick={() => activate(model)} />
                <ActionButton label={lang === 'vi' ? 'Deploy' : 'Deploy'} icon={<Rocket size={14} />} onClick={() => deploy(model)} primary />
                <ActionButton label={lang === 'vi' ? 'Rollback' : 'Rollback'} icon={<RotateCcw size={14} />} onClick={() => rollback(model)} />
                <ActionButton label={lang === 'vi' ? 'Delete' : 'Delete'} icon={<Trash2 size={14} />} onClick={() => remove(model)} danger />
              </div>
            </div>
          ))}
          {!models.length && (
            <div className="premium-card p-10 text-center text-slate-500 xl:col-span-2">
              {lang === 'vi' ? 'Chưa có model version nào. Hãy train dataset để sinh version đầu tiên.' : 'No model versions yet. Train a dataset to generate the first version.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatMetric(metrics: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = metrics?.[key as keyof typeof metrics] as any;
    const numeric = Number(value);
    if (!Number.isNaN(numeric) && value !== undefined && value !== null) {
      return numeric.toFixed(3);
    }
  }
  return '—';
}

function InfoChip({ icon, label, value }: any) {
  return <div className="px-4 py-2 rounded-xl border border-white/5 bg-white/5 flex items-center gap-2">{icon}<span>{label}: {value}</span></div>;
}

function Stat({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-black">{label}</div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function ActionButton({ label, icon, onClick, primary = false, danger = false }: any) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
        primary
          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
          : danger
            ? 'bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20'
            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}